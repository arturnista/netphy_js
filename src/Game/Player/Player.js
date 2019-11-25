const uuid = require('uuid')
const _ = require('lodash')
const planck = require('planck-js')
const Laser = require('../Laser/Laser')
const GameObjectsMasks = require('../GameObjectsMasks')
const MathUtils = require('../../Utils/Math')

class Player {

    constructor({ socket, game, team, respawn } = {}) {

        this.id = uuid.v4()

        this.game = game
        this.socket = socket
        
        this.team = team
        this.size = { x: 5, y: 5 }

        this.speed = 0
        this.maxSpeed = 10
        this.rotateSpeedMoving = 200
        this.rotateSpeed = 300
        this.acceleration = this.maxSpeed * 2
        this.targetDirection = {}
        this.isMoving = false
        
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

        this.useMouseController = true

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
        this.physicsBody = this.game.physics.createBody({
            type: 'dynamic',
            position: planck.Vec2(position.x, position.y),
        })
        this.physicsBody.setUserData(this)
        this.physicsBody.createFixture({
            shape: planck.Circle(this.size.x, planck.Vec2(0, 0), 0),
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
            isAlive: this.isAlive,
            health: this.health,
        }
    }

    respawn() {
        this.isAlive = true
        this.health = this.maxHealth
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

        this.isMoving = false
        if(this.keyIsHold('KeyW')) {
            this.isMoving = true
            this.speed += this.acceleration * deltatime
            if(this.speed > this.maxSpeed) this.speed = this.maxSpeed

            const direction = this.physicsBody.getWorldVector( planck.Vec2(0, -1 * this.speed) )
            this.physicsBody.setLinearVelocity(direction)
        } else if(this.keyIsHold('KeyS')) {
            this.speed -= this.acceleration * deltatime
            if(this.speed < 0) this.speed = 0
        } else if(this.speed > 0) {
            this.speed -= this.acceleration * deltatime
        } else {
            this.speed = 0;
        }

        const { p } = this.physicsBody.getTransform()

        if(this.useMouseController) {

            const mousePos = planck.Vec2(this.inputs.mouse.x, this.inputs.mouse.y)
            const position = planck.Vec2(p.x, p.y)

            this.targetDirection = position.sub(mousePos)
            this.targetDirection.normalize()
            this.fireDirection = MathUtils.vec2MoveTowards(this.fireDirection, this.targetDirection, 5 * deltatime)
            // this.fireDirection.normalize()

            // this.fireDirection = position.sub(mousePos)
            // this.fireDirection.normalize()
            
            // const targetAngle = Math.atan2(this.fireDirection.y, this.fireDirection.x) - Math.PI / 2
            // this.fireAngle = MathUtils.moveTowards(this.fireAngle, targetAngle, 2 * deltatime)

            this.fireAngle = Math.atan2(this.fireDirection.y, this.fireDirection.x) - Math.PI / 2
            this.physicsBody.setAngle(this.fireAngle)

            // this.fireDirection.mul(-1)
    
            if(this.inputs.mouse.isDown) {
                this.isFiring = true
            } else {
                this.isFiring = false
            }

        } else {

            if(this.keyIsHold('KeyD')) {
                let rotateSpeed = this.isMoving ? this.rotateSpeedMoving : this.rotateSpeed
                this.physicsBody.setAngularVelocity(-rotateSpeed * deltatime)
            } else if(this.keyIsHold('KeyA')) {
                let rotateSpeed = this.isMoving ? this.rotateSpeedMoving : this.rotateSpeed
                this.physicsBody.setAngularVelocity(rotateSpeed * deltatime)
            } else {
                this.physicsBody.setAngularVelocity(0)
            }

            if(this.inputs.keyboard['Space']) {
                this.isFiring = true
                this.fireDirection = this.physicsBody.getWorldVector( planck.Vec2(0, 1) )
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
                        p.x + (-this.fireDirection.x * this.size.x * 2),
                        p.y + (-this.fireDirection.y * this.size.y * 2),
                    ),
                    angle: this.fireAngle,
                    team: this.team
                }))
            }

        }

    }

    kill() {
        this.game.physics.destroyBody(this.physicsBody)

        this.isAlive = false
        this.game.playerDeath(this)

        setTimeout(() => this.respawnNextFrame = true, 5000)
    }

    dealDamage(damage) {
        this.health -= damage
        if(this.health <= 0) {
            this.killNextFrame = true
        }
    }

    onBeginContact(collision, contact) {

    }

}

module.exports = Player