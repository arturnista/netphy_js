class Renderer {

    constructor(width, height) {
        this.width = width
        this.height = height

        this.canvas = document.getElementById('game-canvas')
        this.context = this.canvas.getContext('2d')
    }

    clear() {
        this.context.clearRect(
            0, 0,
            this.width, this.height
        )
    }

    drawObject(object) {
        this.context.fillStyle = object.color
        this.context.fillRect(
            object.position.x, object.position.y,
            object.size.x, object.size.y,
        )
    }

}