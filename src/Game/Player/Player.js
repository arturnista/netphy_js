const uuid = require('uuid')
const _ = require('lodash')
const planck = require('planck-js')
const Laser = require('../Laser/Laser')
const GameObjectsMasks = require('../GameObjectsMasks')

class Player {

    constructor({ socket, game, team, respawn } = {}) {

        this.id = uuid.v4()

        this.game = game
        this.socket = socket
        
        this.team = team
        this.size = { x: 10, y: 10 }

        this.force = 8500
        this.rotateSpeed = 300
        
        this.fireAngle = 0
        this.fireDirection = planck.Vec2.zero
        this.isFiring = true
        this.fireDelay = 0.2
        this.currentFireDelay = 0

        this.maxHealth = 100
        this.health = this.maxHealth

        this.isAlive = true
        this.killNextFrame = false
        this.respawnNextFrame = false

        this.useMouseController = false

        this.inputs = { keyboard: {}, mouse: {} }
        this.lastInputs = { keyboard: {}, mouse: {} }
        
        this.respawnArea = respawn
        this.createPhysicsBody()

        this.socket.emit('player_connect', this.getNetInfo())

        console.log(`SocketIO :: Player connected :: ${this.id}`)
        this.socket.on('disconnect', () => {
            console.log(`SocketIO :: Player disconnected :: ${this.id}`)
            this.game.destroyGameObject(this)
        })

        this.socket.on('player_input', (body) => {
            this.lastInputs = this.inputs
            this.inputs = body
        })

    }

    createPhysicsBody() {

        const position = this.respawnArea.getRandomPosition()
        this.physicsBody = this.game.physicsWorld.createBody({
            type: 'dynamic',
            position: planck.Vec2(position.x, position.y),
        })
        this.physicsBody.setUserData(this)
        this.physicsBody.createFixture({
            shape: planck.Box(this.size.y, this.size.x, planck.Vec2(0, 0), 0),
            filterCategoryBits: this.team == 'red' ? GameObjectsMasks.RED_PLAYER : GameObjectsMasks.GREEN_PLAYER,
            filterMaskBits: GameObjectsMasks.EVERYTHING,
        })

    }

    getNetInfo() {
        let position = { x:0, y:0 }
        let angle = 0
        if(this.physicsBody) {
            position = this.physicsBody.getTransform().p
            angle = this.physicsBody.getAngle()
        }
        return {
            id: this.id,
            type: 'Player',
            position,
            angle,
            size: this.size,
            team: this.team,
            isAlive: this.isAlive
        }
    }

    respawn() {
        this.isAlive = true
        this.health = this.maxHealth
        const position = this.respawnArea.getRandomPosition()
        
        this.createPhysicsBody()
    }

    keyIsHold(key) {
        return this.inputs.keyboard[key]
    }

    keyIsDown(key) {
        return !this.lastInputs.keyboard[key] && this.inputs.keyboard[key]
    }

    frame(deltatime) {

        if(this.killNextFrame) {
            this.killNextFrame = false
            this.kill()
        }
        if(this.respawnNextFrame) {
            this.respawnNextFrame = false
            this.respawn()
        }

        if(!this.isAlive) return

        if(this.keyIsHold('KeyW')) {
            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, -1 * this.force * deltatime) )
            this.physicsBody.applyForceToCenter(direction)
        } else if(this.keyIsHold('KeyS')) {
            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, 1 * this.force * deltatime) )
            this.physicsBody.applyForceToCenter(direction)
        }

        if(this.keyIsDown('ShiftLeft') || this.keyIsDown('ShiftRight')) {
            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, -1 * 100000) )
            this.physicsBody.applyForceToCenter(direction)
        }

        if(this.keyIsHold('KeyD')) {
            this.physicsBody.setAngularVelocity(-this.rotateSpeed * deltatime)
        } else if(this.keyIsHold('KeyA')) {
            this.physicsBody.setAngularVelocity(this.rotateSpeed * deltatime)
        } else {
            this.physicsBody.setAngularVelocity(0)
        }

        const { p } = this.physicsBody.getTransform()

        if(this.useMouseController) {

            const mousePos = planck.Vec2(this.inputs.mouse.x, this.inputs.mouse.y)
    
            const position = planck.Vec2(p.x, p.y)
            this.fireDirection = position.sub(mousePos)
            this.fireDirection.normalize()
            
            this.fireAngle = Math.atan2(this.fireDirection.y, this.fireDirection.x) - Math.PI / 2
            this.physicsBody.setAngle(this.fireAngle)
    
            if(this.inputs.mouse.isDown) {
                this.isFiring = true
            } else {
                this.isFiring = false
            }

        } else {

            if(this.inputs.keyboard['Space']) {
                this.isFiring = true
                this.fireDirection = this.physicsBody.getWorldVector( planck.Vec2(0, -1) )
                this.fireAngle = this.physicsBody.getAngle()
            } else {
                this.isFiring = false
            }

        }

        if(this.isFiring) {

            this.currentFireDelay += deltatime
            if(this.currentFireDelay > this.fireDelay) {
                this.currentFireDelay = 0
                
                this.game.createGameObject(new Laser({
                    game: this.game,
                    position: planck.Vec2(
                        p.x + (this.fireDirection.x * this.size.x * 2),
                        p.y + (this.fireDirection.y * this.size.y * 2),
                    ),
                    angle: this.fireAngle,
                    team: this.team
                }))
            }

        }

    }

    kill() {
        this.game.physicsWorld.destroyBody(this.physicsBody)

        this.isAlive = false

        setTimeout(() => this.respawnNextFrame = true, 5000)
    }

    dealDamage(damage) {
        this.health -= damage
        if(this.health <= 0) {
            this.killNextFrame = true
        }
    }

    onBeginContact(collision, contact) {
        // console.log(contact.getManifold())
        // const collisionTeam = _.get(collision, 'team', false)
        // if(collisionTeam && collisionTeam != this.team) {
        //     collision.dealDamage && collision.dealDamage(this.damage)
        //     this.game.destroyGameObject(this)
        // }
    }

}

module.exports = Player