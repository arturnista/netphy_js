const uuid = require('uuid')
const _ = require('lodash')
const planck = require('planck-js')

class Laser {

    constructor({ game, team, position, angle } = {}) {

        this.id = uuid.v4()

        this.game = game
        
        this.damage = 30
        this.speed = 500
        this.team = team
        this.size = {
            x: 1,
            y: 2,
        }

        this.physicsBody = game.physicsWorld.createBody({
            type: 'kinematic',
            bullet: true,
            position: planck.Vec2(position.x, position.y),
        })
        this.physicsBody.createFixture({
            isSensor: true,
            shape: planck.Box(this.size.x, this.size.y, planck.Vec2(0, 0), 0)
        })
        this.physicsBody.setAngle(angle)
        this.physicsBody.setUserData(this)

        const direction = this.physicsBody.getWorldVector( planck.Vec2(0, -1 * this.speed) )
        this.physicsBody.setLinearVelocity(planck.Vec2(direction.x, direction.y))

    }

    getNetInfo() {
        return {
            id: this.id,
            type: 'Laser',
            position: this.physicsBody.getTransform().p,
            angle: this.physicsBody.getAngle(),
            size: this.size,
            team: this.team
        }
    }

    frame() {
        
    }

    onCollision(collision, contact) {
        const collisionTeam = _.get(collision, 'team', false)
        if(collisionTeam && collisionTeam != this.team) {
            collision.dealDamage && collision.dealDamage(this.damage)
            this.game.destroyGameObject(this)
        }
    }

}

module.exports = Laser