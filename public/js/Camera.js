class Camera {

    constructor(app) {

        this.container = new window.PIXI.Container()

        this.height = app.renderer.height / app.renderer.resolution
        this.width = app.renderer.width / app.renderer.resolution

        this.halfHeight = this.height / 2
        this.halfWidth = this.width / 2

        this.zoom = .5

        this.container.position.x = 0
        this.container.position.y = 0
        this.container.scale.y = -1

        this.target = null

    }

    addChild(child) {
        this.container.addChild(child)
    }

    update() {
        if(this.target) {
            const xPiv = this.target.position.x / 2 - (this.width / this.zoom - this.target.position.x) / 2
            const yPiv = this.target.position.y / 2 - (this.height / this.zoom - this.target.position.y) / 2
            this.container.pivot.set(xPiv, yPiv)

            this.container.position.x = 0
            this.container.position.y = this.height
            this.container.scale.x = this.zoom
            this.container.scale.y = -this.zoom
        }
    }

}
// this.container.position.x = -this.target.position.x + this.halfWidth
// this.container.position.y = this.target.position.y + this.halfHeight