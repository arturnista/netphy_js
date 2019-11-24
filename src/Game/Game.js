const io = require('socket.io')
const _ = require('lodash')
const Player = require('./Player/Player')
const Map = require('./Map/Map')
const planck = require('planck-js')

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

class Game {

    constructor() {
        
        this.connection = null
        this.gameObjects = []
        this.physicsWorld = null

        this.gameObjectsToAdd = []
        this.gameObjectsToRemove = []

        this.gameLoop = this.gameLoop.bind(this)
        this.gameLoopInterval = null

        this.lastFrameTime = 0

        this.tick = 0

    }

    create(server) {    
        console.log(`SocketIO :: Room created :: ${server.address().port}`)
        this.connection = io.listen(server)

        this.physicsWorld = planck.World({
            gravity: planck.Vec2(0, -25)
        })
        
        this.physicsStep = 1 / 60
        this.velocityIterations = 8
        this.positionIterations = 3
        
        this.physicsWorld.on('begin-contact', (contact) => {
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()

            const objectA = fixtureA && fixtureA.getBody().getUserData()
            const objectB = fixtureB && fixtureB.getBody().getUserData()

            objectA && objectA.onBeginContact && objectA.onBeginContact(objectB, contact)
            objectB && objectB.onBeginContact && objectB.onBeginContact(objectA, contact)
        })

        this.physicsWorld.on('end-contact', (contact) => {
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()

            const objectA = fixtureA && fixtureA.getBody().getUserData()
            const objectB = fixtureB && fixtureB.getBody().getUserData()

            objectA && objectA.onEndContact && objectA.onEndContact(objectB, contact)
            objectB && objectB.onEndContact && objectB.onEndContact(objectA, contact)
        })

        server.on('connection', function (socket) {
            if(!server.sockets) server.sockets = {}
            socket.id = generateId()
            server.sockets[socket.id] = socket
            socket.on('close', function (closeSocket) {
                delete server.sockets[socket.id]
            })
        })    
        
        let i = 0
        this.connection.on('connection', (socket) => {
            i += 1
            let team = i % 2 ? 'green' : 'red'

            const respawn = team === 'green' ? this.map.greenSpawn : this.map.redSpawn
            let player = new Player({
                socket,
                game: this,
                team,
                respawn
            })
            this.createGameObject(player)  
            socket.emit('map_created', {
                tileSize: this.map.tileSize,
                tiles: this.map.tiles
            })
        })

    }

    createGameObject(gameObject) {
        this.gameObjectsToAdd.push( gameObject )
    }

    destroyGameObject(gameObject) {
        this.gameObjectsToRemove.push( gameObject )
    }

    startGame() {

        this.map = new Map({ game: this })
        this.gameLoopInterval = setInterval(this.gameLoop, this.physicsStep * 1000)

    }

    gameLoop() {

        let deltatime = (new Date() - this.lastFrameTime) / 1000
        this.lastFrameTime = new Date()

        if(this.gameObjectsToAdd.length > 0) {
            this.gameObjects = [
                ...this.gameObjects,
                ...this.gameObjectsToAdd
            ]
            this.gameObjectsToAdd = []
        }

        if(this.gameObjectsToRemove.length > 0) {
            this.gameObjects = this.gameObjects.filter(object => {
                if(this.gameObjectsToRemove.find(x => x.id === object.id) != null) {
                    if(object.physicsBody) {
                        this.physicsWorld.destroyBody(object.physicsBody)
                    }

                    return false
                }
                return true
            })
            this.gameObjectsToRemove = []
        }

        this.physicsWorld.step(this.physicsStep, this.velocityIterations, this.positionIterations)

        this.gameObjects.forEach(obj => obj.frame(deltatime))

        this.connection.emit('game_state', {
            tick: this.tick,
            gameObjects: this.gameObjects.map(x => x.getNetInfo())
        })
        this.tick += 1
    }

}

module.exports = Game