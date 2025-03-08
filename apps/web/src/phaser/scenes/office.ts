export default class Office extends Phaser.Scene {

    constructor ()
    {
        super('Office');
    }

    preload ()
    {
        this.load.image('logo', 'assets/sprites/logo.png');
    }

    create ()
    {
        this.add.image(400, 300, 'logo');
    }

}
