"use client";

import { useEffect, useRef, useState } from "react";

const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [error, setError] = useState<string>("");
  const roomId = 123;

  const [Phaser, setPhaser] = useState<typeof import("phaser") | null>(null);

  useEffect(() => {
    import("phaser").then((mod) => setPhaser(mod));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && Phaser && !gameRef.current) {
      class GameScene extends Phaser.Scene {
        player!: Phaser.Physics.Arcade.Sprite;
        character!: Phaser.Physics.Arcade.Sprite;
        cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        ws!: WebSocket;

        private otherPlayers!: Phaser.Physics.Arcade.Group;
        private otherPlayerMap = new Map<
          string,
          Phaser.Physics.Arcade.Sprite
        >();

        constructor() {
          super({ key: "GameScene" });
          this.ws = new WebSocket("ws://localhost:8001");
          this.ws.onopen = () => {
            this.ws?.send(
              JSON.stringify({
                type: "join", //todo : token is hard coded
                payload: {
                  spaceId: roomId,
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidHlwZSI6InVzZXIiLCJ1c2VySWQiOiJqZWV2YW4xMjMiLCJpYXQiOjE1MTYyMzkwMjJ9.1-Th1tvy1MRJn-1RRTaoyQa41kWyB7rwRi30SrudDKo",
                },
              })
            );
          };
          this.ws.onmessage = (event: any) => {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);
            console.log(this.player);
            this.handleWebsocketMessage(message);
            console.log(this.player.x, this.player.y);
          };
        }

        preload() {
          this.load.image("background", "/assets/background/cloud.jpg");
          this.load.spritesheet("tiles", "/assets/tileset/Basement.png", {
            frameWidth: 32,
            frameHeight: 32,
          });
          this.load.tilemapTiledJSON("map", "/assets/tileset/map.json");
          this.load.spritesheet("adam", "/assets/character/adam.png", {
            frameWidth: 32,
            frameHeight: 48,
          });
        }

        create() {
          if (!this.input) return; // Prevents errors if input is null
          // Add a background covering the whole screen
          this.add
            .image(this.scale.width / 2, this.scale.height / 2, "background")
            .setOrigin(0.5, 0.5)
            .setScale(2); // Adjust scale as needed

          // Example: Creating a static tile sprite
          // this.add.tileSprite(400, 300, 800, 600, "basement");

          const map = this.make.tilemap({ key: "map" });

          const animsFrameRate = 15;
          this.anims.create({
            key: "adam_run_right",
            frames: this.anims.generateFrameNames("adam", {
              start: 24,
              end: 29,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          });

          this.anims.create({
            key: "adam_run_up",
            frames: this.anims.generateFrameNames("adam", {
              start: 30,
              end: 35,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          });

          this.anims.create({
            key: "adam_run_left",
            frames: this.anims.generateFrameNames("adam", {
              start: 36,
              end: 41,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          });

          this.anims.create({
            key: "adam_run_down",
            frames: this.anims.generateFrameNames("adam", {
              start: 42,
              end: 47,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          });
          this.anims.create({
            key: "adam_idle_right",
            frames: this.anims.generateFrameNames("adam", {
              start: 0,
              end: 5,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
          });

          this.anims.create({
            key: "adam_idle_up",
            frames: this.anims.generateFrameNames("adam", {
              start: 6,
              end: 11,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
          });

          this.anims.create({
            key: "adam_idle_left",
            frames: this.anims.generateFrameNames("adam", {
              start: 12,
              end: 17,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
          });

          this.anims.create({
            key: "adam_idle_down",
            frames: this.anims.generateFrameNames("adam", {
              start: 18,
              end: 23,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
          });
          // Set world bounds based on map size
          this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
          );

          // Create the player
          this.player = this.physics.add.sprite(400, 300, "adam");
          this.player.play("adam_idle_down", true);
          this.player.setCollideWorldBounds(true);
          // Make the camera follow the player
          this.cameras.main.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
          );
          this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

          // Optional: Adjust zoom for better visibility
          this.cameras.main.setZoom(2);

          // Ensure input is available before accessing it
          this.cursors =
            this.input?.keyboard?.createCursorKeys() ??
            ({} as Phaser.Types.Input.Keyboard.CursorKeys);
        }

        update() {
          let isLeftPressed = false;
          if (!this.cursors) return;

          let moving = false;

          if (this.cursors.left.isDown && !isLeftPressed) {
            isLeftPressed = true;
            // Send movement request
            console.log(this.player);
            this.ws.send(
              JSON.stringify({
                type: "move",
                payload: {
                  x: this.player.x - 1,
                  y: this.player.y,
                  userId: currentUser.userId,
                  direction: "left",
                },
              })
            );
            if (this.player.anims.currentAnim?.key !== "adam_run_left") {
              this.player.play("adam_run_left", true);
            }
            // this.player.setVelocityX(-160);
            this.player.x -= 1;
            moving = true;
          } else if (this.cursors.right.isDown) {
            console.log("player before going right : ", this.player);
            //send movement event to server
            this.ws.send(
              JSON.stringify({
                type: "move",
                payload: {
                  x: this.player.x + 1,
                  y: this.player.y,
                  userId: currentUser.userId,
                  direction: "right",
                },
              })
            );
            if (this.player.anims.currentAnim?.key !== "adam_run_right") {
              this.player.play("adam_run_right", true);
            }
            // this.player.setVelocityX(160);
            this.player.x += 1;
            moving = true;
          } else {
            this.player.setVelocityX(0);
          }

          if (this.cursors.up.isDown) {
            //send movement event to server
            this.ws.send(
              JSON.stringify({
                type: "move",
                payload: {
                  x: this.player.x,
                  y: this.player.y - 1,
                  userId: currentUser.userId,
                  direction: "up",
                },
              })
            );
            if (this.player.anims.currentAnim?.key !== "adam_run_up") {
              this.player.play("adam_run_up", true);
            }
            // this.player.setVelocityY(-160);
            this.player.y -= 1;
            moving = true;
          } else if (this.cursors.down.isDown) {
            //send movement event to server
            this.ws.send(
              JSON.stringify({
                type: "move",
                payload: {
                  x: this.player.x,
                  y: this.player.y + 1,
                  userId: currentUser.userId,
                  direction: "down",
                },
              })
            );
            if (this.player.anims.currentAnim?.key !== "adam_run_down") {
              this.player.play("adam_run_down", true);
            }
            // this.player.setVelocityY(160);
            this.player.y += 1;
            moving = true;
          } else {
            this.player.setVelocityY(0);
          }

          // If not moving, switch to idle animation based on last direction
          if (!moving) {
            if (this.player.anims.currentAnim?.key.startsWith("adam_run")) {
              const lastAnim = this.player.anims.currentAnim.key.replace(
                "adam_run",
                "adam_idle"
              );
              this.player.play(lastAnim, true);
            }
          }
        }

        private handleWebsocketMessage(message: any) {
          switch (message.type) {
            case "space-joined":
              // Initialize current user position and other users
              console.log("set");
              console.log({
                x: message.payload.spawn.x,
                y: message.payload.spawn.y,
                userId: message.payload.userId,
              });
              setCurrentUser({
                x: message.payload.spawn.x,
                y: message.payload.spawn.y,
                userId: message.payload.userId,
              });
              this.player.x = message.payload.spawn.x;
              this.player.y = message.payload.spawn.y;

              // console.log(this.player.x, this.player.y)
              // Initialize other users from the payload
              const userMap = new Map();
              message.payload.users.forEach((user: any) => {
                userMap.set(user.userId, user);
              });
              setUsers(userMap);
              break;
            case "user-joined":
              // A new player has joined, add them to the arena
              this.handlePlayerJoined(message.payload);
              break;
            case "movement":
              // Update other players' positions based on movement messages
              const user = this.otherPlayerMap.get(message.payload.userId);
              if (user) {
                // Update the other player's position
                user.x = message.payload.x;
                user.y = message.payload.y;

                // Now apply the appropriate animation for the other player
                if (message.payload.direction === "left") {
                  if (user.anims.currentAnim?.key !== "adam_run_left") {
                    user.play("adam_run_left", true);
                  }
                } else if (message.payload.direction === "right") {
                  if (user.anims.currentAnim?.key !== "adam_run_right") {
                    user.play("adam_run_right", true);
                  }
                } else if (message.payload.direction === "up") {
                  if (user.anims.currentAnim?.key !== "adam_run_up") {
                    user.play("adam_run_up", true);
                  }
                } else if (message.payload.direction === "down") {
                  if (user.anims.currentAnim?.key !== "adam_run_down") {
                    user.play("adam_run_down", true);
                  }
                } else {
                  // If no direction is specified (idle)
                  if (user.anims.currentAnim?.key.startsWith("adam_run")) {
                    const lastAnim = user.anims.currentAnim.key.replace(
                      "adam_run",
                      "adam_idle"
                    );
                    user.play(lastAnim, true);
                  }
                }
              }
              break;
          }
        }

        private handlePlayerJoined(newPlayer: any) {
          console.log("new player ====", newPlayer);
          // Add the new player sprite to the game
          const otherPlayer = this.physics.add.sprite(
            newPlayer.x,
            newPlayer.y,
            "adam"
          );
          if (otherPlayer.anims.currentAnim?.key.startsWith("adam_run")) {
            const lastAnim = otherPlayer.anims.currentAnim.key.replace(
              "adam_run",
              "adam_idle"
            );
            otherPlayer.play(lastAnim, true);
          }
          otherPlayer.setCollideWorldBounds(true); // Optionally, you can set collision
          this.otherPlayerMap.set(newPlayer.userId, otherPlayer);
          this.otherPlayers.add(otherPlayer); // Add to the group
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#93cbee",
        transparent: true, // Ensures game background is transparent
        physics: {
          default: "arcade",
          arcade: {
            gravity: {
              y: 0,
              x: 0,
            },
          },
        },
        autoFocus: true,
        scene: [GameScene],
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [Phaser]);

  return <div id="game-container"></div>;
};

export default GameComponent;
