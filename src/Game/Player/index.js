const uuid = require('uuid')

class Player {

    constructor({ socket, game } = {}) {

        this.id = uuid.v4()

        this.game = game
        this.socket = socket
        
        this.color = 'red'
        this.position = {x: 0, y: 0 }
        this.size = { x: 10, y: 10 }

        this.inputs = {}

        console.log(`SocketIO :: Player connected :: ${this.id}`)
        this.socket.on('disconnect', () => {
            console.log(`SocketIO :: Player disconnected :: ${this.id}`)
            this.game.removePlayer(this)
        })

        this.socket.on('player_input', (body) => {
            this.inputs = body
        })

    }

    getNetInfo() {
        return {
            id: this.id,
            position: this.position,
            size: this.size,
            color: this.color
        }
    }

    frame() {
        if(this.inputs['KeyW']) {
            this.position = {
                x: this.position.x,
                y: this.position.y - 1
            }
        } else if(this.inputs['KeyS']) {
            this.position = {
                x: this.position.x,
                y: this.position.y + 1
            }
        }

        if(this.inputs['KeyD']) {
            this.position = {
                x: this.position.x + 1,
                y: this.position.y
            }
        } else if(this.inputs['KeyA']) {
            this.position = {
                x: this.position.x - 1,
                y: this.position.y
            }
        }
    }

}

module.exports = Player