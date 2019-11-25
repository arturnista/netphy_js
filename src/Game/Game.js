const io = require('socket.io')
const _ = require('lodash')
const Player = require('./Player/Player')
const Map = require('./Map/Map')
const planck = require('planck-js')
const Physics = require('./Physics')

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

class Game {

    constructor() {
        
        this.connection = null
        this.gameObjects = []
        this.physics = null

        this.gameObjectsToAdd = []
        this.gameObjectsToRemove = []

        this.gameLoop = this.gameLoop.bind(this)
        this.gameLoopInterval = null
        
        this.emitGameState = this.emitGameState.bind(this)
        this.emitGameStateInterval = null

        this.lastFrameTime = 0

        this.tick = 0

        this.gameScore = {
            red: 0,
            green: 0
        }

    }

    create(server) {    
        console.log(`SocketIO :: Room created :: ${server.address().port}`)
        this.connection = io.listen(server)

        this.physics = new Physics()

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
        this.gameLoopInterval = setInterval(this.gameLoop, 1)
        this.emitGameStateInterval = setInterval(this.emitGameState, 10)

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
                        this.physics.destroyBody(object.physicsBody)
                    }

                    return false
                }
                return true
            })
            this.gameObjectsToRemove = []
        }

        this.physics.step(deltatime)

        this.gameObjects.forEach(obj => obj.frame(deltatime))
    }

    emitGameState() {
        this.connection.emit('game_state', {
            tick: this.tick,
            gameObjects: this.gameObjects.map(x => x.getNetInfo()),
            gameScore: this.gameScore
        })
        this.tick += 1
    }

    playerDeath(player) {
        if(player.team == 'red') {
            this.gameScore.green += 1
        } else if(player.team == 'green') {
            this.gameScore.red += 1
        }
        console.log(this.gameScore)
    }

}

module.exports = Game