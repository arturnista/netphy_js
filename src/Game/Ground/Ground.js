const uuid = require('uuid')
const planck = require('planck-js')

class Ground {

    constructor({ game, size, position } = {}) {

        this.id = uuid.v4()

        this.game = game
        
        this.color = 'black'
        this.size = size

        this.physicsBody = game.physicsWorld.createBody({
            type: 'static',
            position: planck.Vec2(position.x, position.y),
        })
        this.physicsBody.createFixture({
            shape: planck.Box(this.size.x, this.size.y, planck.Vec2(0, 0), 0)
        })

    }

    getNetInfo() {
        const transform = this.physicsBody.getTransform()
        return {
            id: this.id,
            type: 'Ground',
            position: transform.p,
            angle: this.physicsBody.getAngle(),
            size: this.size,
            color: this.color
        }
    }

    frame() {
        
    }

}

module.exports = Ground