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

const getTeam = (function() {
    let i = 0
    return function() { return i++ % 2 ? 'red' : 'green' }
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
        this.gameIsRunning = false

        this.tick = 0
        this.players = []

        this.gameScore = {
            red: 0,
            green: 0
        }
        this.killsToWin = 3

    }

    create(server) {    
        console.log(`SocketIO :: Room created :: ${server.address().port}`)
        this.connection = io.listen(server)

        server.on('connection', function (socket) {
            if(!server.sockets) server.sockets = {}
            socket.id = generateId()
            server.sockets[socket.id] = socket
            socket.on('close', function (closeSocket) {
                delete server.sockets[socket.id]
            })
        })    
        
        this.connection.on('connection', (socket) => {
            let player = new Player({
                socket,
                game: this
            })
            this.players.push(player)

            this.createGameObject(player)  

            if(this.gameIsRunning) {
                socket.emit('game_start', {
                    map: {
                        tileSize: this.map.tileSize,
                        tiles: this.map.tiles
                    }
                })
                this.startPlayer(player)
            }
        })

    }

    createGameObject(gameObject) {
        this.gameObjectsToAdd.push( gameObject )
    }

    playerDisconnect(player) {
        this.players = this.players.filter(x => x.id !== player.id)
        if(this.players.length == 0) this.endGame()
        this.gameObjectsToRemove.push( player )
    }

    destroyGameObject(gameObject) {
        this.gameObjectsToRemove.push( gameObject )
    }

    startPlayer(player) {
        const team = getTeam()
        player.team = team
        const respawn = team === 'green' ? this.map.greenSpawn : this.map.redSpawn
        player.start(respawn)
    }

    startGame(config) {

        if(this.gameIsRunning) return

        this.gameIsRunning = true

        this.physics = new Physics()

        this.map = new Map({ game: this })

        this.players.forEach(this.startPlayer.bind(this))

        this.lastFrameTime = 0
        this.tick = 0

        this.killsToWin = config.killsToWin || 3
        this.refreshDelay = config.refreshDelay || 10

        this.gameScore = {
            red: 0,
            green: 0
        }

        this.gameLoopInterval = setInterval(this.gameLoop, 1)
        this.emitGameStateInterval = setInterval(this.emitGameState, this.refreshDelay)

        this.connection.emit('game_start', {
            map: {
                tileSize: this.map.tileSize,
                tiles: this.map.tiles
            }
        })

    }

    endGame() {

        this.gameIsRunning = false

        clearInterval(this.gameLoopInterval)
        this.gameLoopInterval = null

        clearInterval(this.emitGameStateInterval)
        this.emitGameStateInterval = null

        const winningTeam = this.gameScore.red > this.gameScore.green ? 'red' : 'green'

        this.connection.emit('game_end', {
            winningTeam,
            gameScore: this.gameScore
        })

        this.physics = null
        this.gameObjects = []
        this.players.forEach(player => {
            this.createGameObject(player)  
        })
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
            if(this.gameScore.green >= this.killsToWin) this.endGame()
        } else if(player.team == 'green') {
            this.gameScore.red += 1
            if(this.gameScore.red >= this.killsToWin) this.endGame()
        }
    }

}

module.exports = Game