
class Health
{
    constructor(info)
    {
        this.MaxHealth = info.MaxHealth;
        this.health = info.health;
    }

    getHealth()
    {
        return this.health;
    }

    setHealth()
    {
        this.health = this.MaxHealth
    }

    damage(amt)
    {
        this.health -= amt;
    }

    heal(amt)
    {
        this.health += amt;
    }
}

export default Health;