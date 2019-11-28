const uuid = require('uuid')
const planck = require('planck-js')
const _ = require('lodash')
const GameObjectsMasks = require('../GameObjectsMasks')

class Shield {

    constructor({ player, game, duration }) {
        
        this.id = uuid.v4()
        this.player = player
        this.game = game

        this.shieldTime = duration
        this.shieldTimeCurrent = 0

        this.size = 20

        this.cooldown = 20

        const pos = this.player.getPosition()
        this.physicsBody = this.game.physics.createBody({
            type: 'dynamic',
            position: planck.Vec2(pos.x, pos.y),
        })
        this.physicsBody.setUserData(this)
        this.physicsBody.createFixture({
            shape: planck.Circle(this.size, planck.Vec2(0, 0), 0),
            filterCategoryBits: this.player.team == 'red' ? GameObjectsMasks.RED_PLAYER : GameObjectsMasks.GREEN_PLAYER,
            filterMaskBits: GameObjectsMasks.LASER,
            restitution: 1
        })

        this.game.physics.createJoint(planck.DistanceJoint({
            bodyA: this.player.physicsBody,
            localAnchorA: planck.Vec2(0.5, 0.5),
            bodyB: this.physicsBody,
            localAnchorB: planck.Vec2(0.5, 0.5)
        }))
    }

    getNetInfo() {
        return {
            id: this.id,
            type: 'Shield',
            position: this.physicsBody.getTransform().p,
            size: this.size,
        }
    }

    frame(deltatime) {
        // this.physicsBody.setPosition(planck.Vec2(pos.x, pos.y))

        this.shieldTimeCurrent += deltatime
        if(this.shieldTimeCurrent >= this.shieldTime) {
            this.game.destroyGameObject(this)
        }
    }


}

module.exports = Shield
