class Player extends GameObject {

    constructor(data) {
        super(data)
        let spriteName = 'player_green'
        if(data.team === 'red') spriteName = 'player_red'

        this.sprite = new window.PIXI.Container()

        this.team = data.team

        this.spriteReal = new PIXI.Sprite(PIXI.loader.resources[spriteName].texture)
        this.spriteReal.anchor.set(.5, .5)
        this.spriteReal.width = data.size.x * 2
        this.spriteReal.height = data.size.y * 2
        this.spriteReal.rotation = data.angle
        this.sprite.addChild(this.spriteReal)

        this.healthText = new window.PIXI.Text('100', { fontFamily: 'Arial', fontSize: 10, fill: 0x212121, align: 'center', strokeThickness: .5, stroke: 0xFAFAFA })
        this.healthText.scale.set(1, -1)
        this.healthText.anchor.set(.5, 0)
        this.healthText.position.set(0, -5)
        this.sprite.addChild(this.healthText)

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        // this.sprite.rotation = data.angle
        // this.sprite.anchor.set(.5, .5)
        
    }

    sync(data) {

        if(this.team != data.team) {
            let spriteName = 'player_green'
            if(data.team === 'red') spriteName = 'player_red'
            this.spriteReal.texture = PIXI.loader.resources[spriteName].texture
        }

        this.spriteReal.width = data.size.x * 2
        this.spriteReal.height = data.size.y * 2
        this.spriteReal.rotation = data.angle

        this.sprite.id = data.id
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y

        if(this.isEMPed != data.isEMPed) {
            this.spriteReal.tint = data.isEMPed ? 0xAAAAFF : 0xFFFFFF
        }
        this.isEMPed = data.isEMPed

        if(this.isAlive != data.isAlive) {
            this.sprite.visible = data.isAlive
        }
        this.isAlive = data.isAlive

        if(this.health != data.health) {
            this.healthText.text = data.health
        }
        this.health = data.health

    }

    destroy() {
        super.destroy()
    }

}