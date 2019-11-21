const io = require('socket.io')
const _ = require('lodash')
const Player = require('./Player/Player')
const Ground = require('./Ground/Ground')
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

    }

    create(server) {    
        console.log(`SocketIO :: Room created :: ${server.address().port}`)
        this.connection = io.listen(server)

        this.physicsWorld = planck.World({
            gravity: planck.Vec2(0, -10)
        })
        this.physicsStep = 1 / 60

        this.createGameObject(
            new Ground({
                game: this,
                position: { x: 50, y: 5 },
                size: { x: 100, y: 10 },
            })
        )

        server.on('connection', function (socket) {
            if(!server.sockets) server.sockets = {}
            socket.id = generateId()
            server.sockets[socket.id] = socket
            socket.on('close', function (closeSocket) {
                delete server.sockets[socket.id]
            })
        })    

        this.connection.on('connection', (socket) => {

            let player = new Player({ socket, game: this })
            this.createGameObject(player)
            
        })

    }

    createGameObject(gameObject) {
        this.gameObjectsToAdd.push( gameObject )
    }

    removePlayer(player) {
        this.gameObjectsToRemove.push(player)
    }

    startGame() {

        this.gameLoopInterval = setInterval(this.gameLoop, 10)

    }

    gameLoop() {

        if(this.gameObjectsToAdd.length > 0) {
            this.gameObjects = [
                ...this.gameObjects,
                ...this.gameObjectsToAdd
            ]
            this.gameObjectsToAdd = []
        }

        if(this.gameObjectsToRemove.length > 0) {
            this.gameObjects = this.gameObjects.filter(player => this.gameObjectsToRemove.find(x => x.id === player.id) == null)
            this.gameObjectsToRemove = []
        }

        this.physicsWorld.step(this.physicsStep)

        this.gameObjects.forEach(obj => obj.frame())

        this.connection.emit('game_state', {
            gameObjects: this.gameObjects.map(x => x.getNetInfo())
        })
    }

}

module.exports = Game