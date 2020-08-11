import Health from "./Health.js"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(info)
    {
        // Basic Constructor Info
        super(info.scene, info.x, info.y, info.texture, 'Player');
        this.info = info;
        this.health = new Health({MaxHealth: info.health, health: info.health});

        // Enable Physics on Player (this)
        info.scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        this.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setDrag(500, 500);

        // Enable Physics on player.reticle
        this.reticle = info.scene.physics.add.sprite(800, 700, 'crosshair');
        this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);

        // Add objects to scene
        this.info.scene.add.existing(this);
        this.info.scene.add.existing(this.reticle);

        // Movement Keys
        var moveKeys = this.info.scene.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        // Player Movement (Needed to add this into function scope)
        this.info.scene.input.keyboard.on('keydown_W', function(event) {
            this.setAccelerationY(-800);
        }, this);
        this.info.scene.input.keyboard.on('keydown_S', function(event) {
            this.setAccelerationY(800);
        }, this);
        this.info.scene.input.keyboard.on('keydown_A', function(event) {
            this.setAccelerationX(-800);
        }, this);
        this.info.scene.input.keyboard.on('keydown_D', function(event) {
            this.setAccelerationX(800);
        }, this);

        // Stop Player Acceleration
        this.info.scene.input.keyboard.on('keyup_W', function(event) {
            if(moveKeys['down'].isUp)
                this.setAccelerationY(0);
        }, this);
        this.info.scene.input.keyboard.on('keyup_S', function(event) {
            if(moveKeys['up'].isUp)
                this.setAccelerationY(0);
        }, this);
        this.info.scene.input.keyboard.on('keyup_A', function(event) {
            if(moveKeys['right'].isUp)
                this.setAccelerationX(0);
        }, this);
        this.info.scene.input.keyboard.on('keyup_D', function(event) {
            if(moveKeys['left'].isUp)
                this.setAccelerationX(0);
        }, this);

        // move reticle upon locked pointer move
        this.info.scene.input.on('pointermove', function (pointer) {
            if(this.info.scene.input.mouse.locked)
            {
                // move reticle with mouse
                this.reticle.x += pointer.movementX;
                this.reticle.y += pointer.movementY;

                // only works when camera follows player?
                var distX = this.reticle.x-this.x;
                var distY = this.reticle.y-this.y;

                // prevents reticle off screen
                if(distX > 800)
                    this.reticle.x = this.x+800;
                else if(distX < -800)
                    this.reticle.x = this.x-800;

                if(distY > 600)
                    this.reticle.y = this.y+600;
                else if(distY < -600)
                    this.reticle.y = this.y-600;
            }
        }, this);
    }

    update()
    {
        // Rotates player to face towards reticle
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.reticle.x, this.reticle.y);

        // Camera position
        var avgX = ((this.x + this.reticle.x)/2) - 400;
        var avgY = ((this.y + this.reticle.y)/2) - 300;
        this.info.scene.cameras.main.scrollX = avgX;
        this.info.scene.cameras.main.scrollY = avgY;

        // Reticle moves with this
        this.reticle.body.velocity.x = this.body.velocity.x;
        this.reticle.body.velocity.y = this.body.velocity.y;

        this.constrainVelocity(this, 500);
        this.constrainReticle(this.reticle, 550);
    }

    death()
    {
        this.destroy();
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
        var distX = reticle.x-this.x; // x dist this and ret
        var distY = reticle.y-this.y; // y dist this and ret

        // prevent reticle from going out of bounds
        if(distX > 800)
            reticle.x = this.x+800;
        else if(distX < -800)
            reticle.x = this.x-800;

        if(distY > 600)
            reticle.y = this.y+600;
        else if(distY < -600)
            reticle.y = this.y-600;

        // prevent move away from this
        var distBetween = Phaser.Math.Distance.Between(this.x, this.y, reticle.x, reticle.y);
        if(distBetween > radius)
        {
            // Place reticle on perimeter of circle on line intersecting this and reticle
            var scale = distBetween/radius;

            reticle.x = this.x + (reticle.x - this.x) / scale;
            reticle.y = this.y + (reticle.y - this.y) / scale;
        }
    }
}

export default Player;