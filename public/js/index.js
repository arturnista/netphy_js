window.onload = function() {
    const socket = io('http://localhost:5000')

    const inputManager = new InputManager()
    
    let objects = []
    socket.on('game_state', (body) => {
        objects = body.players.reduce((currentObjects, player) => {
            // Procura o 
            const receivedObject = currentObjects.find(x => x.id === player.id)
            if(receivedObject) {
                receivedObject.position = player.position
                receivedObject.size = player.size
                return currentObjects
            } else {
                return [
                    ...currentObjects,
                    player
                ]
            }
        }, objects)
    })

    setInterval(() => {
        socket.emit('player_input', inputManager.keysPressed)
    }, 10);

    const renderer = new Renderer(800, 600)
    const renderFrame = () => {
        renderer.clear()
        for (let i = 0; i < objects.length; i++) {
            renderer.drawObject(objects[i])
        }
        requestAnimationFrame(renderFrame)
    }
    requestAnimationFrame(renderFrame)

};