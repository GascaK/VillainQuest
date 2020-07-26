class Boot extends Phaser.Scene{
    constructor() {
        super('Boot');
    }

    create(){
        this.add.text(20, 20, 'Loading...');
        this.scene.start('MainMenu');
    }
}