import { resolve } from "path";

const WS_URL = "ws://localhost:3001";

let ws1: WebSocket;  // Global variables
let ws2: WebSocket;
let adminToken: string;
let userToken: string;
let userX: number;
let userY: number;
let adminX: number;
let adminY: number;
let adminId: string | number;
let userId: string | number;
let spaceId: string | number;
let ws1Messages: message[] = [];
let ws2Messages: message[] = [];

type message = {
    type: string;
    payload: any;  // payload could be any shape depending on the message
};

// TODO: create a function to set up websocket
async function setupWs() {
    ws1 = new WebSocket(WS_URL);
    await new Promise<void>(resolve => {
        ws1.onopen = () => resolve();
    });
    ws1.onmessage = (event: MessageEvent) => {
        ws1Messages.push(JSON.parse(event.data));
    };

    ws2 = new WebSocket(WS_URL);
    await new Promise<void>(resolve => {
        ws2.onopen = () => resolve();
    });
    ws2.onmessage = (event: MessageEvent) => {
        ws2Messages.push(JSON.parse(event.data));
    };
}

function waitForAndPopLatestMessage(messageArray: message[]): Promise<message | undefined> {
    return new Promise((resolve) => {
        if (messageArray.length > 0) {
            resolve(messageArray.shift());
        } else {
            let interval = setInterval(() => {
                if (messageArray.length > 0) {
                    resolve(messageArray.shift());
                    clearInterval(interval);
                }
            }, 100);
        }
    });
}

describe("Websocket connections", () => {
    beforeAll(() => {
        setupWs();
    });

    it("should return the acknowledgment to the user after joining", async () => {
        ws1.send(
            JSON.stringify({
                type: "join",
                payload: {
                    spaceId: spaceId!,
                    token: adminToken!,
                },
            })
        );
        const message1 = await waitForAndPopLatestMessage(ws1Messages);

        ws2.send(
            JSON.stringify({
                type: "join",
                payload: {
                    spaceId: spaceId!,
                    token: userToken!,
                },
            })
        );
        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);

        expect(message1?.type).toBe("space-joined");
        expect(message2?.type).toBe("space-joined");

        expect(message1?.payload.users.length).toBe(0)
        expect(message2?.payload.users.length).toBe(1);
        expect(message3?.type).toBe("user-join");
        expect(message3?.payload.x).toBe(message2?.payload.spawn.x);
        expect(message3?.payload.y).toBe(message2?.payload.spawn.y);
        expect(message3?.payload.userId).toBe(userId!);

        adminX = message1?.payload.spawn.x ?? 0;
        adminY = message1?.payload.spawn.y ?? 0;

        userX = message2?.payload.spawn.x ?? 0;
        userY = message2?.payload.spawn.y ?? 0;
    });

    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(
            JSON.stringify({
                type: "movement",
                payload: {
                    x: 10000,
                    y: 10000,
                },
            })
        );
        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message?.type).toBe("movement-rejected");
        expect(message?.payload.x).toBe(adminX);
        expect(message?.payload.y).toBe(adminY);
    });

    test("User should not be able to move two blocks at the same time", async () => {
        ws1.send(
            JSON.stringify({
                type: "movement",
                payload: {
                    x: adminX + 2,
                    y: adminY,
                },
            })
        );
        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message?.type).toBe("movement-rejected");
        expect(message?.payload.x).toBe(adminX);
        expect(message?.payload.y).toBe(adminY);
    });

    test("Correct movement should be broadcasted to other sockets in the room", async () => {
        ws1.send(
            JSON.stringify({
                type: "movement",
                payload: {
                    x: adminX + 1,
                    y: adminY,
                    userId: adminId!,
                },
            })
        );
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message?.type).toBe("movement");
        expect(message?.payload.x).toBe(adminX + 1);
        expect(message?.payload.y).toBe(adminY);
    });

    test("User should be notified when the other user leaves", async () => {
        ws1.close();
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message?.type).toBe("user-left");
        expect(message?.payload.userId).toBe(adminId!);
        expect(message?.payload.y).toBe(adminY);
    });
});
