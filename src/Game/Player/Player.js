const uuid = require('uuid')
const planck = require('planck-js')
const Bullet = require('../Bullet/Bullet')

class Player {

    constructor({ socket, game } = {}) {

        this.id = uuid.v4()

        this.game = game
        this.socket = socket
        
        this.color = '#FFCC00'
        this.size = { x: 10, y: 10 }

        this.inputs = { keyboard: {}, mouse: {} }
        this.lastInputs = { keyboard: {}, mouse: {} }

        this.physicsBody = game.physicsWorld.createBody({
            type: 'dynamic',
            position: planck.Vec2(15, 300),
        })
        this.physicsBody.createFixture({
            shape: planck.Box(this.size.y, this.size.x, planck.Vec2(0, 0), 0)
        })

        console.log(`SocketIO :: Player connected :: ${this.id}`)
        this.socket.on('disconnect', () => {
            console.log(`SocketIO :: Player disconnected :: ${this.id}`)
            this.game.removePlayer(this)
        })

        this.socket.on('player_input', (body) => {
            this.lastInputs = this.inputs
            this.inputs = body
        })

    }

    getNetInfo() {
        const transform = this.physicsBody.getTransform()
        return {
            id: this.id,
            type: 'Player',
            position: transform.p,
            angle: this.physicsBody.getAngle(),
            size: this.size,
            color: this.color
        }
    }

    frame() {
        
        if(this.inputs.keyboard['KeyW']) {
            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, 1) )
            direction.x *= 100;
            direction.y *= 100;
            this.physicsBody.applyForceToCenter(direction)
        } else if(this.inputs.keyboard['KeyS']) {
            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, 1) )
            direction.x *= -100;
            direction.y *= -100;
            this.physicsBody.applyForceToCenter(direction)
        }

        if(this.inputs.keyboard['KeyD']) {
            this.physicsBody.setAngularVelocity(10)
            // this.physicsBody.applyForceToCenter(planck.Vec2(30, 0))
        } else if(this.inputs.keyboard['KeyA']) {
            this.physicsBody.setAngularVelocity(10)
            // this.physicsBody.applyForceToCenter(planck.Vec2(-30, 0))
        }

        if(!this.lastInputs.mouse.isDown && this.inputs.mouse.isDown) {
            this.game.createGameObject(new Bullet({ game: this.game, position: this.physicsBody.getTransform().p }))
        }

    }

}

module.exports = Player