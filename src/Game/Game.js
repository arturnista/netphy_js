const io = require('socket.io')
const _ = require('lodash')
const Player = require('./Player')

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

class Game {

    constructor() {
        
        this.connection = null
        this.players = []
        this.physicsWorld = null

        this.playersToAdd = []
        this.playersToRemove = []

        this.gameLoop = this.gameLoop.bind(this)
        this.gameLoopInterval = null

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

            let player = new Player({ socket, game: this })
            this.playersToAdd.push(player)
            
        })

    }

    removePlayer(player) {
        this.playersToRemove.push(player)
    }

    startGame() {

        this.gameLoopInterval = setInterval(this.gameLoop, 10)

    }

    gameLoop() {

        if(this.playersToAdd.length > 0) {
            this.players = [
                ...this.players,
                ...this.playersToAdd
            ]
            this.playersToAdd = []
        }

        if(this.playersToRemove.length > 0) {
            this.players = this.players.filter(player => this.playersToRemove.find(x => x.id === player.id) == null)
            this.playersToRemove = []
        }

        this.players.forEach(player => player.frame())

        this.connection.emit('game_state', {
            players: this.players.map(x => x.getNetInfo())
        })
    }

}

module.exports = Game