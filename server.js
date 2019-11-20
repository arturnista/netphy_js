const express = require('express')
const cors = require('cors')
const server = express()
const bodyParser = require('body-parser')

const Game = require('./src/Game/Game')

const figlet = require('figlet')
const http = require('http')

const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'https://nwgame.pro', 'http://nwgame.pro', 'http://191.235.86.235', 'http://magearena.com', 'https://magearena.com']
const corsOptionsDelegate = function (req, callback) {
    // callback(null, {})
    const corsOptions = { origin: whitelist.indexOf(req.header('Origin')) !== -1 }
    callback(null, corsOptions)
}
server.use(cors(corsOptionsDelegate))
server.use(bodyParser.json())

server.set('views', __dirname + '')
server.engine('html', require('ejs').renderFile)

server.get('/', function(req, res, next) {
    res.render('public/index.html')
})
server.get('/css/:filename', function(req, res, next) {
    res.sendFile(`${__dirname}/public/css/${req.params.filename}`)
})
server.get('/js/:filename', function(req, res, next) {
    res.sendFile(`${__dirname}/public/js/${req.params.filename}`)
})

const port = process.env.PORT || 5000

const startCallback = function() {
    console.log('\n\n' + figlet.textSync('Multi\nPhys', 'Delta Corps Priest 1'));
    console.log(`Server running on port ${port}\n\n`);
}

httpServer = http.Server(server)
httpServer.listen(port, startCallback)

const game = new Game()
game.create(httpServer)