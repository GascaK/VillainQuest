import Health from "./Health.js"

class Hero extends Phaser.Physics.Arcade.Sprite {
    constructor(info)
    {
        super(info.scene, info.x, info.y, info.texture, 'Hero');
        this.info = info;
        this.player = info.player;

        this.xVel = 0;
        this.yVel = 0;

        info.scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;

        this.speed = 15;
        info.scene.add.existing(this);

        info.scene.physics.add.collider(this, this.player, this.playerHit, null, this);
    }

    playerHit()
    {
        console.log('hit');
        this.player.health.damage(10);
    }

    death()
    {
        this.destroy();
    }

    update(time, delta, player)
    {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.direction = Math.atan( (player.x-this.x) / (player.y-this.y) );

        if(player.y >= this.y)
        {
            this.xVel = this.speed*Math.sin(this.direction);
            this.yVel = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xVel = -this.speed*Math.sin(this.direction);
            this.yVel = -this.speed*Math.cos(this.direction);
        }

        this.body.setVelocityX(this.xVel * delta + this.speed);
        this.body.setVelocityY(this.yVel * delta + this.speed);
    }
}

export default Hero;