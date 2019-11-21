window.onload = function() {

    const inputManager = new InputManager()
    let gameObjects = []
    let receivedGameObjects = []

    this.game = new Phaser.Game({
        type: Phaser.AUTO,
        // canvas: document.getElementById("game-canvas"),
        parent: 'game-content',
        width: 800,
        height: 600,
        scene: {
            preload: preload,
            create: create,
            update: update,
        }
    })

    function preload ()
    {
        this.load.image('player_green', 'img/playerShip2_green.png')
        this.load.image('player_red', 'img/playerShip2_red.png')
    }

    function create () {

        const socket = io('http://localhost:5000')
        
        socket.on('game_state', (body) => {
            receivedGameObjects = body.gameObjects
        })

        setInterval(() => {
            socket.emit('player_input', {
                keyboard: inputManager.keyboard,
                mouse: inputManager.mouse,
            })
        }, 10)

    }

    function update() {
        gameObjects = receivedGameObjects.reduce((currentObjects, object) => {
            // Procura o 
            const receivedObject = currentObjects.find(x => x.id === object.id)
            if(receivedObject) {
                receivedObject.x = object.position.x
                receivedObject.y = object.position.y
                // receivedObject.size = object.size
                // receivedObject.angle = object.angle
                return currentObjects
            } else {
                const newSprite = this.add.sprite(object.x, object.y, 'player_green')
                newSprite.id = object.id
                return [
                    ...currentObjects,
                    newSprite
                ]
            }
        }, gameObjects)
        // console.log(gameObjects)
    }

};