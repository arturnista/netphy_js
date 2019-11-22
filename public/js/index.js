window.PIXI = PIXI
// window.PIXI.sound = PixiSound
const textures = {}
let camera

const inputManager = new InputManager()
let gameObjects = []
let receivedGameObjects = []

window.onload = function() {
    
    const socket = io(window.location.href)
    // const socket = io('http://localhost:5000')
    
    socket.on('game_state', (body) => {
        receivedGameObjects = body.gameObjects
    })

    setInterval(() => {
        socket.emit('player_input', {
            keyboard: inputManager.keyboard,
            mouse: inputManager.mouse,
        })
    }, 10)

    createApp()
    .then(app => {
        camera = new window.PIXI.Container()
    
        app.stage.addChild(camera)

        app.renderer.render(app.stage)
        app.ticker.add(gameLoop)
    })


}

function createApp() {

    const app = new window.PIXI.Application({
        width: 800,
        height: 600,
        antialias: true,
        transparent: false,
        resolution: 1,
        backgroundColor: 0x061639
    })
    document.getElementById("game-content").appendChild(app.view)

    return new Promise((resolve, reject) => {
        PIXI.loader
            .add('player_green.png', '/img/playerShip2_green.png')
            .add('player_red.png', '/img/playerShip2_red.png')
            .load(() => {
                resolve(app)
            })
    })

}

function gameLoop(delta) {
    const deltatime = delta * 0.016666667

    gameObjects = receivedGameObjects.reduce((currentObjects, object) => {
        // Procura o 
        const receivedObject = currentObjects.find(x => x.id === object.id)
        if(receivedObject) {
            receivedObject.x = object.position.x
            receivedObject.y = object.position.y
            receivedObject.rotation = object.angle
            receivedObject.width = object.size.x * 2
            receivedObject.height = object.size.y * 2
            return currentObjects
        } else {
            const newSprite = new PIXI.Sprite(PIXI.loader.resources['player_green.png'].texture)
            newSprite.id = object.id
            newSprite.x = object.position.x
            newSprite.y = object.position.y
            newSprite.rotation = object.angle
            newSprite.width = object.size.x * 2
            newSprite.height = object.size.y * 2
            newSprite.anchor.set(.5, .5)
            camera.addChild(newSprite)
            return [
                ...currentObjects,
                newSprite
            ]
        }
    }, gameObjects)
}