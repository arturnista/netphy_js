const uuid = require('uuid')
const planck = require('planck-js')

class Bullet {

    constructor({ game, position } = {}) {

        this.id = uuid.v4()

        this.game = game
        
        this.color = 'black'
        this.size = {
            x: 5,
            y: 10,
        }

        this.physicsBody = game.physicsWorld.createBody({
            type: 'dynamic',
            bullet: true,
            position: planck.Vec2(position.x, position.y),
        })
        this.physicsBody.createFixture({
            shape: planck.Box(this.size.x, this.size.y, planck.Vec2(0, 0), 0)
        })

        this.physicsBody.linearVelocity = planck.Vec2(10, 0)

    }

    getNetInfo() {
        const transform = this.physicsBody.getTransform()
        return {
            id: this.id,
            type: 'Bullet',
            position: transform.p,
            angle: this.physicsBody.getAngle(),
            size: this.size,
            color: this.color
        }
    }

    frame() {
        
    }

}

module.exports = Bullet