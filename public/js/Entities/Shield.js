class Shield extends GameObject {

    constructor(data) {
        super(data)

        this.sprite = new PIXI.Sprite(PIXI.loader.resources['laser_explosion_08'].texture)
        this.sprite.anchor.set(.5, .5)
        this.sprite.width = data.size * 2
        this.sprite.height = data.size * 2
        this.sprite.addChild(this.sprite)
        
    }

    sync(data) {
        
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y

    }

}