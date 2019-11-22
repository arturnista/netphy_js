window.PIXI = PIXI
// window.PIXI.sound = PixiSound
let hasLoaded = false

const textures = {}
let camera = null

let inputManager = null
let gameObjects = []
let playerData = {}

window.onload = function() {
    hasLoaded = false

    createApp()
    .then(app => {
        hasLoaded = true
        inputManager = new InputManager()

        camera = new window.PIXI.Container()
        camera.position.y = app.renderer.height / app.renderer.resolution
        camera.scale.y = -1
    
        app.stage.addChild(camera)

        app.renderer.render(app.stage)
        app.ticker.add(gameLoop)

        connectSocket()
    })
}

function connectSocket() {
    
    const socket = io(window.location.href)
    socket.on('game_state', (body) => {
        if(!hasLoaded) return

        // Create the new objects
        for (const object of body.gameObjects) {
            // Find if object should be updated
            const objectToUpdate = gameObjects.find(x => x.id === object.id)
            if(objectToUpdate) {
                // Update object data
                objectToUpdate.x = object.position.x
                objectToUpdate.y = object.position.y
                objectToUpdate.rotation = object.angle
                objectToUpdate.width = object.size.x * 2
                objectToUpdate.height = object.size.y * 2
                objectToUpdate._tick = body.tick
            } else {
                // Add the new object
                let newGameObject = null
                switch (object.type) {
                    case 'Player':
                        newGameObject = new Player(object)
                        break
                    case 'Laser':
                        newGameObject = new Laser(object)
                        break
                    case 'Water':
                        newGameObject = new Water(object)
                        break
                    default:
                        break
                }
                if(!newGameObject) return 
                newGameObject._tick = body.tick
    
                camera.addChild(newGameObject.sprite)
                gameObjects.push(newGameObject)
            }
        }

        gameObjects = gameObjects.filter(x => {
            if(x._tick != body.tick) {
                x.destroy()
                return false
            }
            return true
        })

    })

    socket.on('player_connect', (body) => {
        playerData = body
    })

    setInterval(() => {
        if(!inputManager) return
        socket.emit('player_input', {
            keyboard: inputManager.keyboard,
            mouse: inputManager.mouse,
        })
    }, 10)
}

function createApp() {

    const app = new window.PIXI.Application({
        width: 200,
        height: 150,
        antialias: false,
        transparent: false,
        resolution: 5,
        backgroundColor: 0x061639
    })
    document.getElementById("game-content").appendChild(app.view)

    return new Promise((resolve, reject) => {
        PIXI.loader
            .add('player_green', '/img/playerShip2_green.png')
            .add('player_red', '/img/playerShip2_red.png')
            .add('ground', '/img/ground.png')
            .add('water', '/img/water.png')
            .add('waterTop', '/img/waterTop.png')
            .add('laser_red', '/img/laserRed.png')
            .add('laser_green', '/img/laserGreen.png')
            .load(() => {
                resolve(app)
            })
    })

}

function gameLoop(delta) {
    const deltatime = delta * 0.016666667
    gameObjects.forEach(element => element.update && element.update())
}