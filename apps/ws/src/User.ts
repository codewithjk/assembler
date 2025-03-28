import { WebSocket } from "ws";

import { RoomManager } from "./RoomManager";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { OutgoingMessage } from "./types";

export class User {
    public id: string;
    public userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;
    constructor(private ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 200; // todo : the first coordinates should be random
        this.y = 200;
        this.initHandlers();
    }
    initHandlers() {
        this.ws.on("message", (data) => {
            const parsedData = JSON.parse(data.toString());
            console.log(parsedData);

            switch (parsedData.type) {
                case "join":
                    console.log("join", parsedData)
                    try {
                        const spaceId = parsedData.payload.spaceId;
                        const token = parsedData.payload.token;
                        // Attempt to verify the token
                        const decoded = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
                        // if (!decoded || !decoded.userId) {
                        //     throw new Error("Invalid token");
                        // }
                        const userId = decoded.userId;
                        console.log(userId)
                        if (!userId) {
                            this.ws.close();
                            return;
                        }
                        this.userId = userId
                        //TODO : find the space in the db and close the socket if space doesn't exists.
                        this.spaceId = spaceId;
                        RoomManager.getInstance().addUser(spaceId, this);
                        this.send({
                            type: "space-joined",
                            payload: {
                                spawn: {
                                    x: this.x,
                                    y: this.y
                                },
                                users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
                            }
                        });
                        RoomManager.getInstance().broadcast({
                            type: "user-joined",
                            payload: {
                                userId: this.userId,
                                x: this.x,
                                y: this.y
                            }

                        }, this, this.spaceId!)
                    } catch (error) {
                        // Send an error message to the client before closing
                        this.send({
                            type: "error",
                            payload: { message: "Authentication failed. Invalid token.", error: error }
                        });
                        this.ws.close();
                    }
                    break;
                case "move":
                    console.info("move : ",parsedData, this.x,this.y)
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const xDisplacement = Math.abs(this.x - moveX);
                    const yDisplacement = Math.abs(this.y - moveY);

                    console.info("displacement : ",xDisplacement,yDisplacement)
                    if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) {
                        this.x = moveX;
                        this.y = moveY;                        
                        RoomManager.getInstance().broadcast({
                            type: "movement",
                            payload: {
                                userId:this.userId,
                                x: this.x,
                                y: this.y,
                                direction: parsedData.payload.direction, 
                            }
                        }, this, this.spaceId!);
                        return
                    }
                    this.send({
                        type: 'movement-rejected',
                        payload: {
                            x: this.x,
                            y: this.y,
                            direction: parsedData.payload.direction, 
                        }
                    })
                    break;
            }
        })
    }
    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }
    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
