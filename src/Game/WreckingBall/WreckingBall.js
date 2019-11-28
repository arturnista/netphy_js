const uuid = require('uuid')
const planck = require('planck-js')
const _ = require('lodash')
const GameObjectsMasks = require('../GameObjectsMasks')

class WreckingBall {

    constructor({ player, game, duration, range }) {
        
        this.id = uuid.v4()
        this.player = player
        this.game = game

        this.shieldTime = duration
        this.shieldTimeCurrent = 0

        this.size = 10

        this.cooldown = 20

        const pos = this.player.getPosition()
        this.physicsBody = this.game.physics.createBody({
            type: 'dynamic',
            position: planck.Vec2(pos.x, pos.y - range),
        })
        this.physicsBody.setUserData(this)
        this.physicsBody.createFixture({
            shape: planck.Circle(this.size, planck.Vec2(0, 0), 0),
            filterCategoryBits: this.player.team == 'red' ? GameObjectsMasks.RED_PLAYER : GameObjectsMasks.GREEN_PLAYER,
            filterMaskBits: this.player.team == 'red' ? GameObjectsMasks.GREEN_PLAYER : GameObjectsMasks.RED_PLAYER
        })

        this.game.physics.createJoint(planck.DistanceJoint({
            frequencyHz: 0,
            dampingRatio: 1,
            bodyA: this.player.physicsBody,
            localAnchorA: planck.Vec2(0.5, 0.5),
            bodyB: this.physicsBody,
            localAnchorB: planck.Vec2(0.5, 0.5)
        }))
    }

    getNetInfo() {
        return {
            id: this.id,
            type: 'WreckingBall',
            position: this.physicsBody.getTransform().p,
            angle: this.physicsBody.getAngle(),
            size: this.size,
        }
    }

    frame(deltatime) {
        this.shieldTimeCurrent += deltatime
        if(this.shieldTimeCurrent >= this.shieldTime) {
            this.game.destroyGameObject(this)
        }
    }

    onBeginContact(collision, contact) {
        const collisionTeam = _.get(collision, 'team', false)
        if(collisionTeam && collisionTeam != this.team) {
            collision.dealDamage && collision.dealDamage(Math.ceil(this.physicsBody.getLinearVelocity().length()))
            this.game.destroyGameObject(this)
        }
        
    }

}

module.exports = WreckingBall
