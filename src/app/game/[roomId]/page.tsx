"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

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

        constructor() {
          super({ key: "GameScene" });
        }

        preload() {
          this.load.image(
            "background",
            "/assets/background/cloud.jpg"
          );
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
          const tileset = map.addTilesetImage("Basement", "tiles");
          const layer = map.createLayer("Ground", tileset);

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
          if (!this.cursors) return;

          let moving = false;

          if (this.cursors.left.isDown) {
            if (this.player.anims.currentAnim?.key !== "adam_run_left") {
              this.player.play("adam_run_left", true);
            }
            this.player.setVelocityX(-160);
            moving = true;
          } else if (this.cursors.right.isDown) {
            if (this.player.anims.currentAnim?.key !== "adam_run_right") {
              this.player.play("adam_run_right", true);
            }
            this.player.setVelocityX(160);
            moving = true;
          } else {
            this.player.setVelocityX(0);
          }

          if (this.cursors.up.isDown) {
            if (this.player.anims.currentAnim?.key !== "adam_run_up") {
              this.player.play("adam_run_up", true);
            }
            this.player.setVelocityY(-160);
            moving = true;
          } else if (this.cursors.down.isDown) {
            if (this.player.anims.currentAnim?.key !== "adam_run_down") {
              this.player.play("adam_run_down", true);
            }
            this.player.setVelocityY(160);
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

const GamePage: React.FC = () => {
  return (
    <div className="bg-amber-400">
      <GameComponent />
    </div>
  );
};

// export default dynamic(() => Promise.resolve(GamePage), { ssr: false });

export default GameComponent;
