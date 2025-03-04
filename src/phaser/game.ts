
// import Game from './scenes/Game'
// import Background from './scenes/Background'
import initRoom from '@/phaser/scenes/initRoom'
import { AUTO, Game } from 'phaser';
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'phaser-container',
  backgroundColor: '#93cbee',
  pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
          y: 0,
          x: 0
      },
      debug: false,
    },
  },
  autoFocus: true,
  scene: [initRoom],
}

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;