window.PIXI = PIXI
// window.PIXI.sound = PixiSound
let hasLoaded = false

const textures = {}
let camera = null

let inputManager = null
let gameObjects = []
let playerData = {}
let pixiApp = null

let gameScore = {
    red: 0,
    green: 0
}

let greenScoreText = null
let redScoreText = null

let inputInterval = null

let gameConfig = {
    killsToWin: 3,
    refreshDelay: 10
}

window.onload = function() {
    hasLoaded = false

    greenScoreText = document.getElementById("green-lifes")
    redScoreText = document.getElementById("red-lifes")
    updateScores(gameScore)
    
    let loadingModal = document.getElementById("loading-modal")
    createApp()
    .then(app => {
        loadingModal.style.display = "none"
        hasLoaded = true
        pixiApp = app
        inputManager = new InputManager()
        
        camera = new Camera(app)
    
        app.stage.addChild(camera.container)

        app.renderer.render(app.stage)
        app.ticker.add(gameLoop)

        connectSocket()
    })
}

function updateScores(gameScore) {
    greenScoreText.innerText = gameScore.green + 'x'
    redScoreText.innerText = gameScore.red + 'x'
}

function connectSocket() {
    
    const socket = io(window.location.href)
    socket.on('game_state', (body) => {
        if(!hasLoaded) return

        if(gameScore.red != body.gameScore.red || gameScore.green != body.gameScore.green) {
            updateScores(body.gameScore)
        }
        gameScore = body.gameScore

        // Create the new objects
        for (const object of body.gameObjects) {
            // Find if object should be updated
            const objectToUpdate = gameObjects.find(x => x.id === object.id)
            
            if(camera.target.id == object.id) {
                camera.target = object
            }

            if(objectToUpdate) {
                if(object.type == 'Player' && objectToUpdate.isAlive && !object.isAlive) {
                    let explosion = createPlayerExplosion()
                    explosion.x = object.position.x
                    explosion.y = object.position.y
                    camera.addChild(explosion)
                }

                objectToUpdate.sync(object)
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

        gameObjects = gameObjects.filter(object => {
            if(object._tick != body.tick) {
                let explosion
                if(object.type === 'Player') {
                    explosion = createPlayerExplosion()
                } else if(object.type === 'Laser') {
                    explosion = createLaserExplosion()
                }
                explosion.x = object.sprite.x
                explosion.y = object.sprite.y
                camera.addChild(explosion)
                
                object.destroy()
                return false
            }
            return true
        })

    })

    socket.on('game_start', (body) => {
        body.map.tiles.forEach(element => {
            if(element.id == 0) return
            const mapSprite = new MapSprite(element, body.map.tileSize)
            camera.addChild(mapSprite.sprite) 
        })

        inputInterval = setInterval(() => {
            if(!inputManager) return
            const worldMousePos = camera.screenToPosition(inputManager.mouse)
            socket.emit('player_input', {
                keyboard: inputManager.keyboard,
                mouse: Object.assign({}, inputManager.mouse, worldMousePos),
            })
        }, 10)
    })

    socket.on('game_end', (body) => {
        clearInterval(inputInterval)
        inputInterval = null

        document.getElementById("final-game-modal").style.display = "flex"
        document.getElementById("final-game-winning-team").innerText = body.winningTeam
        document.getElementById("final-game-winning-team").classList.add(body.winningTeam)
        updateScores(body.gameScore)

        setTimeout(() => {
            document.getElementById("final-game-modal").style.display = "none"
            document.getElementById("final-game-winning-team").innerText = body.winningTeam
            document.getElementById("final-game-winning-team").classList.remove(body.winningTeam)
        }, 5000)
    })

    socket.on('player_connect', (body) => {
        playerData = body
        camera.target = body
    })

    document.getElementById("start-game-button").addEventListener("click", function() {
        socket.emit('player_game_start', gameConfig)
    })
    
    document.getElementById("refresh-delay-input").value = gameConfig.refreshDelay
    document.getElementById("refresh-delay-input").addEventListener('input', function(event) {
        gameConfig.refreshDelay = parseInt(event.target.value)  
    })
    document.getElementById("kills-to-win-input").value = gameConfig.killsToWin
    document.getElementById("kills-to-win-input").addEventListener('input', function(event) {
        gameConfig.killsToWin = parseInt(event.target.value)  
    })
}

function createApp() {

    const app = new window.PIXI.Application({
        width: 200,
        height: 150,
        antialias: false,
        transparent: false,
        resolution: 5,
        backgroundColor: 0x212121
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
            .add('arena', '/map/arena.tmx')
            .add('tile000', '/img/tile000.png')
            .add('tile001', '/img/tile001.png')
            .add('tile002', '/img/tile002.png')
            .add('tile003', '/img/tile003.png')
            .add('tile004', '/img/tile004.png')
            .add('tile005', '/img/tile005.png')
            .add('tile006', '/img/tile006.png')
            .add('tile007', '/img/tile007.png')
            .add('tile008', '/img/tile008.png')
            .add('tile009', '/img/tile009.png')
            .add('tile010', '/img/tile010.png')
            .add('tile011', '/img/tile011.png')
            .add('tile012', '/img/tile012.png')
            .add('tile013', '/img/tile013.png')
            .add('tile014', '/img/tile014.png')
            .add('tile015', '/img/tile015.png')
            .add('tile016', '/img/tile016.png')
            .add('tile017', '/img/tile017.png')
            .add('tile018', '/img/tile018.png')
            .add('tile019', '/img/tile019.png')
            .add('tile020', '/img/tile020.png')
            .add('tile021', '/img/tile021.png')
            .add('tile022', '/img/tile022.png')
            .add('tile023', '/img/tile023.png')
            .add('tile024', '/img/tile024.png')
            .add('tile025', '/img/tile025.png')
            .add('tile026', '/img/tile026.png')
            .add('tile027', '/img/tile027.png')
            .add('tile028', '/img/tile028.png')
            .add('tile029', '/img/tile029.png')
            .add('tile030', '/img/tile030.png')
            .add('tile031', '/img/tile031.png')
            .add('tile032', '/img/tile032.png')
            .add('tile033', '/img/tile033.png')
            .add('tile034', '/img/tile034.png')
            .add('tile035', '/img/tile035.png')
            .add('tile036', '/img/tile036.png')
            .add('tile037', '/img/tile037.png')
            .add('tile038', '/img/tile038.png')
            .add('tile039', '/img/tile039.png')
            .add('tile040', '/img/tile040.png')
            .add('tile041', '/img/tile041.png')
            .add('tile042', '/img/tile042.png')
            .add('tile043', '/img/tile043.png')
            .add('tile044', '/img/tile044.png')
            .add('tile045', '/img/tile045.png')
            .add('tile046', '/img/tile046.png')
            .add('tile047', '/img/tile047.png')
            .add('tile048', '/img/tile048.png')
            .add('tile049', '/img/tile049.png')
            .add('tile050', '/img/tile050.png')
            .add('tile051', '/img/tile051.png')
            .add('tile052', '/img/tile052.png')
            .add('tile053', '/img/tile053.png')
            .add('tile054', '/img/tile054.png')
            .add('tile055', '/img/tile055.png')
            .add('tile056', '/img/tile056.png')
            .add('tile057', '/img/tile057.png')
            .add('tile058', '/img/tile058.png')
            .add('tile059', '/img/tile059.png')
            .add('tile060', '/img/tile060.png')
            .add('tile061', '/img/tile061.png')
            .add('tile062', '/img/tile062.png')
            .add('tile063', '/img/tile063.png')
            .add('tile064', '/img/tile064.png')
            .add('tile065', '/img/tile065.png')
            .add('tile066', '/img/tile066.png')
            .add('tile067', '/img/tile067.png')
            .add('tile068', '/img/tile068.png')
            .add('tile069', '/img/tile069.png')
            .add('tile070', '/img/tile070.png')
            .add('tile071', '/img/tile071.png')
            .add('tile072', '/img/tile072.png')
            .add('tile073', '/img/tile073.png')
            .add('tile074', '/img/tile074.png')
            .add('tile075', '/img/tile075.png')
            .add('tile076', '/img/tile076.png')
            .add('tile077', '/img/tile077.png')
            .add('tile078', '/img/tile078.png')
            .add('tile079', '/img/tile079.png')
            .add('tile080', '/img/tile080.png')
            .add('tile081', '/img/tile081.png')
            .add('tile082', '/img/tile082.png')
            .add('tile083', '/img/tile083.png')
            .add('tile084', '/img/tile084.png')
            .add('tile085', '/img/tile085.png')
            .add('tile086', '/img/tile086.png')
            .add('tile087', '/img/tile087.png')
            .add('tile088', '/img/tile088.png')
            .add('tile089', '/img/tile089.png')
            .add('tile090', '/img/tile090.png')
            .add('tile091', '/img/tile091.png')
            .add('tile092', '/img/tile092.png')
            .add('tile093', '/img/tile093.png')
            .add('tile094', '/img/tile094.png')
            .add('tile095', '/img/tile095.png')
            .add('tile096', '/img/tile096.png')
            .add('tile097', '/img/tile097.png')
            .add('tile098', '/img/tile098.png')
            .add('tile099', '/img/tile099.png')
            .add('tile100', '/img/tile100.png')
            .add('tile101', '/img/tile101.png')
            .add('tile102', '/img/tile102.png')
            .add('tile103', '/img/tile103.png')
            .add('tile104', '/img/tile104.png')
            .add('tile105', '/img/tile105.png')
            .add('tile106', '/img/tile106.png')
            .add('tile107', '/img/tile107.png')
            .add('tile108', '/img/tile108.png')
            .add('tile109', '/img/tile109.png')
            .add('tile110', '/img/tile110.png')
            .add('tile111', '/img/tile111.png')
            .add('tile112', '/img/tile112.png')
            .add('tile113', '/img/tile113.png')
            .add('tile114', '/img/tile114.png')
            .add('tile115', '/img/tile115.png')
            .add('tile116', '/img/tile116.png')
            .add('tile117', '/img/tile117.png')
            .add('tile118', '/img/tile118.png')
            .add('tile119', '/img/tile119.png')
            .add('tile120', '/img/tile120.png')
            .add('tile121', '/img/tile121.png')
            .add('tile122', '/img/tile122.png')
            .add('tile123', '/img/tile123.png')
            .add('tile124', '/img/tile124.png')
            .add('tile125', '/img/tile125.png')
            .add('tile126', '/img/tile126.png')
            .add('tile127', '/img/tile127.png')
            .add('tile128', '/img/tile128.png')
            .add('tile129', '/img/tile129.png')
            .add('tile130', '/img/tile130.png')
            .add('tile131', '/img/tile131.png')
            .add('tile132', '/img/tile132.png')
            .add('tile133', '/img/tile133.png')
            .add('tile134', '/img/tile134.png')
            .add('tile135', '/img/tile135.png')
            .add('tile136', '/img/tile136.png')
            .add('tile137', '/img/tile137.png')
            .add('tile138', '/img/tile138.png')
            .add('tile139', '/img/tile139.png')
            .add('tile140', '/img/tile140.png')
            .add('tile141', '/img/tile141.png')
            .add('tile142', '/img/tile142.png')
            .add('tile143', '/img/tile143.png')
            .add('tile144', '/img/tile144.png')
            .add('tile145', '/img/tile145.png')
            .add('tile146', '/img/tile146.png')
            .add('tile147', '/img/tile147.png')
            .add('tile148', '/img/tile148.png')
            .add('tile149', '/img/tile149.png')
            .add('tile150', '/img/tile150.png')
            .add('tile151', '/img/tile151.png')
            .add('tile152', '/img/tile152.png')
            .add('tile153', '/img/tile153.png')
            .add('tile154', '/img/tile154.png')
            .add('tile155', '/img/tile155.png')
            .add('tile156', '/img/tile156.png')
            .add('tile157', '/img/tile157.png')
            .add('tile158', '/img/tile158.png')
            .add('tile159', '/img/tile159.png')
            .add('tile160', '/img/tile160.png')
            .add('tile161', '/img/tile161.png')
            .add('tile162', '/img/tile162.png')
            .add('tile163', '/img/tile163.png')
            .add('tile164', '/img/tile164.png')
            .add('tile165', '/img/tile165.png')
            .add('tile166', '/img/tile166.png')
            .add('tile167', '/img/tile167.png')
            .add('tile168', '/img/tile168.png')
            .add('tile169', '/img/tile169.png')
            .add('tile170', '/img/tile170.png')
            .add('tile171', '/img/tile171.png')
            .add('tile172', '/img/tile172.png')
            .add('tile173', '/img/tile173.png')
            .add('tile174', '/img/tile174.png')
            .add('tile175', '/img/tile175.png')
            .add('tile176', '/img/tile176.png')
            .add('tile177', '/img/tile177.png')
            .add('tile178', '/img/tile178.png')
            .add('tile179', '/img/tile179.png')
            .add('tile180', '/img/tile180.png')
            .add('tile181', '/img/tile181.png')
            .add('tile182', '/img/tile182.png')
            .add('tile183', '/img/tile183.png')
            .add('tile184', '/img/tile184.png')
            .add('tile185', '/img/tile185.png')
            .add('tile186', '/img/tile186.png')
            .add('tile187', '/img/tile187.png')
            .add('tile188', '/img/tile188.png')
            .add('tile189', '/img/tile189.png')
            .add('tile190', '/img/tile190.png')
            .add('tile191', '/img/tile191.png')
            .add('tile192', '/img/tile192.png')
            .add('tile193', '/img/tile193.png')
            .add('tile194', '/img/tile194.png')
            .add('tile195', '/img/tile195.png')
            .add('tile196', '/img/tile196.png')
            .add('tile197', '/img/tile197.png')
            .add('tile198', '/img/tile198.png')
            .add('tile199', '/img/tile199.png')
            .add('tile200', '/img/tile200.png')
            .add('tile201', '/img/tile201.png')
            .add('tile202', '/img/tile202.png')
            .add('tile203', '/img/tile203.png')
            .add('tile204', '/img/tile204.png')
            .add('tile205', '/img/tile205.png')
            .add('tile206', '/img/tile206.png')
            .add('tile207', '/img/tile207.png')
            .add('tile208', '/img/tile208.png')
            .add('tile209', '/img/tile209.png')
            .add('tile210', '/img/tile210.png')
            .add('tile211', '/img/tile211.png')
            .add('tile212', '/img/tile212.png')
            .add('tile213', '/img/tile213.png')
            .add('tile214', '/img/tile214.png')
            .add('tile215', '/img/tile215.png')
            .add('tile216', '/img/tile216.png')
            .add('tile217', '/img/tile217.png')
            .add('tile218', '/img/tile218.png')
            .add('tile219', '/img/tile219.png')
            .add('tile220', '/img/tile220.png')
            .add('tile221', '/img/tile221.png')
            .add('tile222', '/img/tile222.png')
            .add('tile223', '/img/tile223.png')
            .add('tile224', '/img/tile224.png')
            .add('tile225', '/img/tile225.png')
            .add('tile226', '/img/tile226.png')
            .add('tile227', '/img/tile227.png')
            .add('tile228', '/img/tile228.png')
            .add('tile229', '/img/tile229.png')
            .add('tile230', '/img/tile230.png')
            .add('tile231', '/img/tile231.png')
            .add('tile232', '/img/tile232.png')
            .add('tile233', '/img/tile233.png')
            .add('tile234', '/img/tile234.png')
            .add('tile235', '/img/tile235.png')
            .add('tile236', '/img/tile236.png')
            .add('tile237', '/img/tile237.png')
            .add('tile238', '/img/tile238.png')
            .add('tile239', '/img/tile239.png')
            .add('tile240', '/img/tile240.png')
            .add('tile241', '/img/tile241.png')
            .add('tile242', '/img/tile242.png')
            .add('tile243', '/img/tile243.png')
            .add('tile244', '/img/tile244.png')
            .add('tile245', '/img/tile245.png')
            .add('tile246', '/img/tile246.png')
            .add('tile247', '/img/tile247.png')
            .add('tile248', '/img/tile248.png')
            .add('tile249', '/img/tile249.png')
            .add('tile250', '/img/tile250.png')
            .add('tile251', '/img/tile251.png')
            .add('tile252', '/img/tile252.png')
            .add('tile253', '/img/tile253.png')
            .add('tile254', '/img/tile254.png')
            .add('tile255', '/img/tile255.png')
            .add('tile256', '/img/tile256.png')
            .add('tile257', '/img/tile257.png')
            .add('tile258', '/img/tile258.png')
            .add('tile259', '/img/tile259.png')
            .add('tile260', '/img/tile260.png')
            .add('tile261', '/img/tile261.png')
            .add('tile262', '/img/tile262.png')
            .add('tile263', '/img/tile263.png')
            .add('explosion_00', '/img/explosion_00.png')
            .add('explosion_01', '/img/explosion_01.png')
            .add('explosion_02', '/img/explosion_02.png')
            .add('explosion_03', '/img/explosion_03.png')
            .add('explosion_04', '/img/explosion_04.png')
            .add('explosion_05', '/img/explosion_05.png')
            .add('laser_explosion_00', '/img/spell_explosion_00.png')
            .add('laser_explosion_01', '/img/spell_explosion_01.png')
            .add('laser_explosion_02', '/img/spell_explosion_02.png')
            .add('laser_explosion_03', '/img/spell_explosion_03.png')
            .add('laser_explosion_04', '/img/spell_explosion_04.png')
            .add('laser_explosion_05', '/img/spell_explosion_05.png')
            .add('laser_explosion_06', '/img/spell_explosion_06.png')
            .add('laser_explosion_07', '/img/spell_explosion_07.png')
            .add('laser_explosion_08', '/img/spell_explosion_08.png')
            .add('laser_explosion_09', '/img/spell_explosion_09.png')
            .load(() => {
                resolve(app)
            })
    })

}

function gameLoop(delta) {
    const deltatime = delta * 0.016666667
    gameObjects.forEach(element => element.update && element.update(deltatime))
    camera.update(deltatime)
}