"use client";

import GameScene from "@/phaser/scenes/Game";
import { useEffect, useRef, useState } from "react";


const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  const [Phaser, setPhaser] = useState<typeof import("phaser") | null>(null);

  useEffect(() => {
    import("phaser").then((mod) => setPhaser(mod));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && Phaser && !gameRef.current) {

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
