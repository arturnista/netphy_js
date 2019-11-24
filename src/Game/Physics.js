const planck = require('planck-js')
const _ = require('lodash')

class Physics {

    constructor() {

        this.world = planck.World({
            gravity: planck.Vec2(0, -10)
        })
        
        this.physicsStep = 1 / 60
        this.velocityIterations = 8
        this.positionIterations = 3
        
        this.world.on('begin-contact', (contact) => {
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()

            const objectA = fixtureA && fixtureA.getBody().getUserData()
            const objectB = fixtureB && fixtureB.getBody().getUserData()

            objectA && objectA.onBeginContact && objectA.onBeginContact(objectB, contact)
            objectB && objectB.onBeginContact && objectB.onBeginContact(objectA, contact)
        })

        this.world.on('end-contact', (contact) => {
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()

            const objectA = fixtureA && fixtureA.getBody().getUserData()
            const objectB = fixtureB && fixtureB.getBody().getUserData()

            objectA && objectA.onEndContact && objectA.onEndContact(objectB, contact)
            objectB && objectB.onEndContact && objectB.onEndContact(objectA, contact)
        })

    }

    createBody(def) {
        return this.world.createBody(def)
    }

    destroyBody(body) {
        this.world.destroyBody(body)
    }

    step(deltatime) {

        // this.world.step(deltatime, this.velocityIterations, this.positionIterations)
        this.world.step(this.physicsStep, this.velocityIterations, this.positionIterations)

    }

}

module.exports = Physics
