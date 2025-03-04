
import { Scene } from 'phaser';


export default class initRoom extends Scene{
    private preloadComplete = false;
    player!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;


    
    constructor() {
        super("initRoom")
    }
    preload() {
    
        this.load.spritesheet('basement', '/assets/tileset/Basement.png', {
            frameWidth: 32,
            frameHeight: 32,
        })
        this.load.spritesheet('adam', '/assets/character/adam.png', {
            frameWidth: 32,
            frameHeight: 48,
          })
        this.load.on("complete", () =>{
            this.preloadComplete = true
        })
    }
    init() {
        // do network things
    }
    create() {
        const animsFrameRate = 15;
        this.anims.create({
            key: 'adam_run_right',
            frames: this.anims.generateFrameNames('adam', {
              start: 24,
              end: 29,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          })
        
          this.anims.create({
            key: 'adam_run_up',
            frames: this.anims.generateFrameNames('adam', {
              start: 30,
              end: 35,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          })
        
          this.anims.create({
            key: 'adam_run_left',
            frames: this.anims.generateFrameNames('adam', {
              start: 36,
              end: 41,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          })
        
          this.anims.create({
            key: 'adam_run_down',
            frames: this.anims.generateFrameNames('adam', {
              start: 42,
              end: 47,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
          })
        this.player = this.add.sprite(400, 300, "adam");
        this.player.play("adam_run_down",true)

    }
    update() {
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(160);
        } else {
          this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
          this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(160);
        } else {
          this.player.setVelocityY(0);
        }
      }
}