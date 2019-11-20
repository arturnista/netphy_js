class InputManager {

    constructor() {

        this.keysPressed = {}
        window.addEventListener("keydown", (event) => {
            this.keysPressed[event.code] = true
            
        })
        
        window.addEventListener("keyup", (event) => {
            delete this.keysPressed[event.code]
        })

    }

}