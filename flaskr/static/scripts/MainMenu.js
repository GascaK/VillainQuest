class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('playbut', 'static/img/play_but.png');
    }

    create() {
        var playButton = this.add.sprite(400, 300, 'playbut').setInteractive();

        playButton.on('pointerdown', function(pointer) {
            this.scene.start('VQuest');
        }, this);
    }
}