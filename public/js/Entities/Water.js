class Water extends GameObject {

    constructor(data) {
        super(data)
        this.sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources['waterTop'].texture, 64, 64)

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        this.sprite.rotation = data.angle
        this.sprite.width = data.size.x * 2
        this.sprite.height = data.size.y * 2
        this.sprite.scale.y = -1
        this.sprite.tileScale.x = 1
        this.sprite.tileScale.y = 1
        this.sprite.anchor.set(.5, .5)
    }

    update() {
        // this.sprite.tilePosition.x += .5
    }   

}