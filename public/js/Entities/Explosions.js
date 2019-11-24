function createPlayerExplosion({ autoplay = true } = { autoplay: true }) {
    let images = [ 'explosion_00', 'explosion_01', 'explosion_02', 'explosion_03', 'explosion_04', 'explosion_05' ]
    let textureArray = images.map(x => PIXI.loader.resources[x].texture)

    const explosion = new window.PIXI.extras.AnimatedSprite(textureArray)
    explosion.width = 20
    explosion.height = 20
    explosion.anchor.set(.5, .5)
    explosion.animationSpeed = .1
    explosion.loop = false
    explosion.onComplete = () => {
        explosion.visible = false
        explosion.destroy()
    }
    if(autoplay) {
        explosion.play()
    }

    return explosion
}

function createLaserExplosion({ autoplay = true } = { autoplay: true }) {
    let images = [ 'laser_explosion_00', 'laser_explosion_01', 'laser_explosion_02', 'laser_explosion_03', 'laser_explosion_04', 'laser_explosion_05', 'laser_explosion_06', 'laser_explosion_07', 'laser_explosion_08', 'laser_explosion_09' ]
    let textureArray = images.map(x => PIXI.loader.resources[x].texture)

    const explosion = new window.PIXI.extras.AnimatedSprite(textureArray)
    explosion.width = 10
    explosion.height = 10
    explosion.anchor.set(.5, .5)
    explosion.animationSpeed = .4
    explosion.loop = false
    explosion.onComplete = () => {
        explosion.visible = false
        explosion.destroy()
    }
    if(autoplay) {
        explosion.play()
    }

    return explosion
}