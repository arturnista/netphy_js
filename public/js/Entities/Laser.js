class Laser extends GameObject {

    constructor(data) {
        super()
        let spriteName = 'laser_green'
        if(data.team === 'red') spriteName = 'laser_red'

        this.sprite = new PIXI.Sprite(PIXI.loader.resources[spriteName].texture)

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        this.sprite.rotation = data.angle
        this.sprite.width = data.size.x * 2
        this.sprite.height = data.size.y * 2
        this.sprite.anchor.set(.5, .5)
    }

}