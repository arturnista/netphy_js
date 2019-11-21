class InputManager {

    constructor() {

        this.keyboard = {}
        this.mouse = { x: 0, y: 0, isDown: false }
        window.addEventListener("keydown", (event) => {
            this.keyboard[event.code] = true
            
        })
        
        window.addEventListener("keyup", (event) => {
            delete this.keyboard[event.code]
        })

        // this.canvas = document.getElementById('game-canvas')
        // this.rect = this.canvas.getBoundingClientRect()
        // this.width = this.canvas.offsetWidth
        // this.height = this.canvas.offsetHeight

        // this.canvas.addEventListener('mousemove', (event) => {
        //     this.mouse.x = event.clientX - this.rect.left;
        //     this.mouse.y = this.height - event.clientY - this.rect.top;
        // })

        // this.canvas.addEventListener('mousedown', (event) => {
        //     this.mouse.isDown = true
        // })

        // this.canvas.addEventListener('mouseup', (event) => {
        //     this.mouse.isDown = false
        // })

    }

}