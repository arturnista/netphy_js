class GameObject {

    constructor(data) {
        this.id = data.id
        this.type = data.type
    }

    sync(data) {
        if(!this.sprite) return

        this.type = data.type
        
        this.sprite.x = data.position.x
        this.sprite.y = data.position.y
        this.sprite.rotation = data.angle
        this.sprite.width = data.size.x * 2
        this.sprite.height = data.size.y * 2
    }

    destroy() {
        this.sprite.destroy()
    }

}
