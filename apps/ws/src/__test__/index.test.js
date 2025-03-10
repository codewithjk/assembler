const { WebSocket } = require("ws");
const WS_URL = "ws://localhost:8001"
// TODO: create a function to set up websocket
describe("Websocket tests", () => {
    let adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwidHlwZSI6ImFkbWluIiwidXNlcklkIjoiamVldmFuMTI0IiwiaWF0IjoxNTE2MjM5MDIyfQ.NljdGY2f9HtQNAEwmaHljFUhQQN9MJpPAB7BtO3xIJ8";
    let adminUserId = "jeevan124";
    let userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6InVzZXIiLCJ1c2VySWQiOiJqZWV2YW4xMjMiLCJpYXQiOjE1MTYyMzkwMjJ9.1-Th1tvy1MRJn-1RRTaoyQa41kWyB7rwRi30SrudDKo";
    let adminId;
    let userId = "jeevan123";
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId ="123";
    let ws1; 
    let ws2;
    let ws1Messages = []
    let ws2Messages = []
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopLatestMessage(messageArray) {
        console.log(messageArray)
        return new Promise(resolve => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupWs() {
        ws1 = new WebSocket(WS_URL)

        ws1.onmessage = (event) => {
            console.log("got back adata 1")
            console.log(event.data)
            
            ws1Messages.push(JSON.parse(event.data))
            console.log(ws1Messages,ws2Messages)
        }
        await new Promise(r => {
          ws1.onopen = r
        })

        ws2 = new WebSocket(WS_URL)

        ws2.onmessage = (event) => {
            console.log("got back data 2")
            console.log(event.data)
            ws2Messages.push(JSON.parse(event.data));
            console.log(ws1Messages,ws2Messages)

        }
        await new Promise(r => {
            ws2.onopen = r  
        })
    }
    
    
    beforeAll(async () => {
        await setupWs()
    })

    test("Get back ack for joining the space", async () => {
        console.log("insixce first test")
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        console.log("insixce first test1")
        const message1 = await waitForAndPopLatestMessage(ws1Messages);
    
        console.log("insixce first test2")
        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))
        console.log("insixce first test3")

        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);
        console.log(message1,message2,message3)

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")
        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })


    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 1000000,
                y: 10000
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("User should not be able to move two blocks at the same time", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("Correct movement should be broadcasted to the other sockets in the room",async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }));

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close()
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left")
        expect(message.payload.userId).toBe(adminUserId)
    })
})