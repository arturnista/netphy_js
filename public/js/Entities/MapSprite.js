class MapSprite extends GameObject {

    constructor(data, size) {
        super(data)
        const tileId = (data.id).toString()
        const spriteName = 'tile' + (tileId.length == 1 ? '00' + tileId : tileId.length == 2 ? '0' + tileId : tileId)
        this.sprite = new PIXI.Sprite(PIXI.loader.resources[spriteName].texture)
        
        const realSize = size * 2
        const halfRealSize = realSize / 2

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        this.sprite.rotation = 0
        this.sprite.width = realSize
        this.sprite.height = realSize
        this.sprite.anchor.set(.5, .5)
    }

}