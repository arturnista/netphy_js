const io = require('socket.io')
const _ = require('lodash')

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

class Game {

    constructor() {
        
        this.connection = null
        this.users = []
        this.physicsWorld = null

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

            console.log('Someone connected!')
            socket.on('disconnect', () => {
                console.log('Someone disconnected!')

                // console.log(`SocketIO :: User disconnect :: ${user.id}`)
                // this.userLeftRoom(user)

                // const ownerId = _.get(this, 'owner.id')
                // if(user.id === ownerId) this.delete()
                // else if(this.users.length === 0) this.delete()

                // this.users = this.users.filter(x => x.id !== user.id)

            })
        })

    }

    startGame() {

    }

}

module.exports = Game