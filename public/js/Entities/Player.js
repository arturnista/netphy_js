class Player extends GameObject {

    constructor(data) {
        super(data)
        let spriteName = 'player_green'
        if(data.team === 'red') spriteName = 'player_red'

        this.sprite = new window.PIXI.Container()

        this.spriteReal = new PIXI.Sprite(PIXI.loader.resources[spriteName].texture)
        this.spriteReal.anchor.set(.5, .5)
        this.spriteReal.width = data.size.x * 2
        this.spriteReal.height = data.size.y * 2
        this.sprite.addChild(this.spriteReal)

        this.positionText = new window.PIXI.Text('100', { fontFamily: 'Arial', fontSize: 10, fill: 0x212121, align: 'center', strokeThickness: .5, stroke: 0xFAFAFA })
        this.positionText.scale.set(1, -1)
        this.positionText.anchor.set(.5, 0)
        this.positionText.position.set(0, -5)
        this.sprite.addChild(this.positionText)

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        this.sprite.rotation = data.angle
        // this.sprite.anchor.set(.5, .5)
        
    }

    sync(data) {

        this.spriteReal.width = data.size.x * 2
        this.spriteReal.height = data.size.y * 2
        this.spriteReal.rotation = data.angle

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y

    }

}