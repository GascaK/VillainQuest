class VQuest extends Phaser.Scene {
    constructor() {
        super('VQuest');
    }

    preload()
    {
        // Load imgs
        /*this.load.spritesheet('player', 'dude.png',
            { frameWidth: 66, frameHeight: 60 }
        );*/

        // Static is somehow relative to flaskr location. Need to verify
        // this will be true in production.
        this.load.image('background', '/static/scripts/assets/floor.jpg');
        this.load.image('villain', '/static/scripts/assets/dude.jpg');
        this.load.image('crosshair', '/static/scripts/assets/cross.png');
    }

    create()
    {
        var moveKeys = null;

        // World Bounds
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Players and reticle
        var background = this.add.image(800, 600, 'background');
        player = this.physics.add.image(800, 600, 'villain');
        reticle = this.physics.add.sprite(800, 700, 'crosshair')

        background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
        player.setOrigin(0.5, 0.5).setDisplaySize(132,120).setCollideWorldBounds(true).setDrag(500,500);
        reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
        
        // Camera zoom
        this.cameras.main.zoom = 0.5;

        // Movement Keys
        moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        this.input.keyboard.on('keydown_W', function(event) {
            player.setAccelerationY(-800);
        });
        this.input.keyboard.on('keydown_S', function(event) {
            player.setAccelerationY(800);
        });
        this.input.keyboard.on('keydown_A', function(event) {
            player.setAccelerationX(-800);
        });
        this.input.keyboard.on('keydown_D', function(event) {
            player.setAccelerationX(800);
        });

        // Stop Player Acceleration
        this.input.keyboard.on('keyup_W', function(event) {
            if(moveKeys['down'].isUp)
                player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_S', function(event) {
            if(moveKeys['up'].isUp)
                player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_A', function(event) {
            if(moveKeys['right'].isUp)
                player.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_D', function(event) {
            if(moveKeys['left'].isUp)
                player.setAccelerationX(0);
        });

        // Lock mouse onto game
        game.canvas.addEventListener('mousedown', function() {
            game.input.mouse.requestPointerLock();
        });
        // Exit Mouse lock
        this.input.keyboard.on('keydown_Q', function(event) {
            if(game.input.mouse.locked)
                game.input.mouse.releasePointerLock();
        }, 0, this);

        // move reticle upon locked pointer move
        this.input.on('pointermove', function (pointer) {
            if(this.input.mouse.locked)
            {
                // move reticle with mouse
                reticle.x += pointer.movementX;
                reticle.y += pointer.movementY;

                // only works when camera follows player?
                var distX = reticle.x-player.x;
                var distY = reticle.y-player.y;

                // prevents reticle off screen
                if(distX > 800)
                    reticle.x = player.x+800;
                else if(distX < -800)
                    reticle.x = player.x-800;

                if(distY > 600)
                    reticle.y = player.y+600;
                else if(distY < -600)
                    reticle.y = player.y-600;
            }
        }, this);

    }

    constrainVelocity(sprite, maxVelocity)
    {
        if(!sprite || !sprite.body)
            return;

        // Gets current velocity of sprite
        var angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;

        // Math
        if(currVelocitySqr > maxVelocity * maxVelocity)
        {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }

    constrainReticle(reticle, radius)
    {
        var distX = reticle.x-player.x; // x dist player and ret
        var distY = reticle.y-player.y; // y dist player and ret

        // prevent reticle from going out of bounds
        if(distX > 800)
            reticle.x = player.x+800;
        else if(distX < -800)
            reticle.x = player.x-800;

        if(distY > 600)
            reticle.y = player.y+600;
        else if(distY < -600)
            reticle.y = player.y-600;

        // prevent move away from player
        var distBetween = Phaser.Math.Distance.Between(player.x, player.y, reticle.x, reticle.y);
        if(distBetween > radius)
        {
            // Place reticle on perimeter of circle on line intersecting player and reticle
            var scale = distBetween/radius;

            reticle.x = player.x + (reticle.x - player.x) / scale;
            reticle.y = player.y + (reticle.y - player.y) / scale;
        }

    }

    update(time, delta)
    {
        // Rotates player to face towards reticle
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

        // Camera position
        var avgX = ((player.x + reticle.x)/2) - 400;
        var avgY = ((player.y + reticle.y)/2) - 300;
        this.cameras.main.scrollX = avgX;
        this.cameras.main.scrollY = avgY;

        // Reticle moves with player
        reticle.body.velocity.x = player.body.velocity.x;
        reticle.body.velocity.y = player.body.velocity.y;

        this.constrainVelocity(player, 500);

        this.constrainReticle(reticle, 550);
    }
}

class MainMenu extends Phaser.Scene {
    constructor() {
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

var player = null;
var reticle = null;

var game = new Phaser.Game(config);