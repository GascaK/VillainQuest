import Player from "./Player.js"
import Hero from "./Hero.js"

class VQuest extends Phaser.Scene {
    constructor() {
        super('VQuest');
    }

    preload()
    {
        // Static is somehow relative to flaskr location. Need to verify
        // this will be true in production.
        this.load.image('background', '/static/scripts/assets/floor.jpg');
        this.load.image('villain', '/static/scripts/assets/dude.jpg');
        this.load.image('crosshair', '/static/scripts/assets/cross.png');
        this.load.image('hero', '/static/scripts/assets/hero.jpg');
    }

    create()
    {
        // World Bounds
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Background
        var background = this.add.image(800, 600, 'background');
        background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
        
        // Camera zoom
        this.cameras.main.zoom = 0.5;

        // Player
        this.player = new Player({
            scene: this,
            name: 'player',
            health: 100,
            x: 800, y: 600,
            texture: 'villain'
        });

        // Bad Guys
        this.hero = [];
        for(var i=0; i<10; i++)
        {
            this.hero.push(new Hero({
                scene: this,
                name: 'hero',
                health: 100,
                x: i*100+100, y: 100,
                texture: 'hero',
                player: this.player
            }));
        }

        // Add collider to collide with eGroup
        var eGroup = this.physics.add.group(this.hero[0]);
        eGroup = this.physics.add.group(this.hero[1]);
        this.physics.add.collider(eGroup);

        // Lock mouse onto game
        game.canvas.addEventListener('mousedown', function() {
            game.input.mouse.requestPointerLock();
        });
        // Exit Mouse lock
        this.input.keyboard.on('keydown_Q', function(event) {
            if(game.input.mouse.locked)
                game.input.mouse.releasePointerLock();
        }, 0, this);

    }
    
    // Main Update function
    update(time, delta)
    {
        // Badguy Update
        this.hero.forEach(en => en.update(time, delta, this.player));

        // Player Update
        this.player.update(time, delta);

        if(this.player.health.getHealth() <= 0) 
        {
            this.player.death();
            this.hero.forEach(en => en.death())
            this.scene.start('MainMenu');
        }
    }
}

class MainMenu extends Phaser.Scene {
    constructor()
    {
        super('MainMenu');
    }

    preload() {
        this.load.image('playB', '/static/scripts/assets/play_but.png');
    }

    create() {
        var playB = this.add.sprite(400, 300, 'playB').setInteractive();

        playB.on('pointerdown', function(pointer) {
            this.scene.start('VQuest');
        }, this);
    }
}

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
    scene: [MainMenu, VQuest]
};

var game = new Phaser.Game(config);