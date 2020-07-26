var config = {
    type: Phaser.AUTO,
    parent: 'gameScreen',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: [MainMenu, Boot, VQuest]
    };

var game = new Phaser.Game(config);
game.scene.start('Boot');