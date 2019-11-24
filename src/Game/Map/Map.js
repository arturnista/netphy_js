const uuid = require('uuid')
const _ = require('lodash')
const planck = require('planck-js')
const arena = require('./arena')
const GameObjectsMasks = require('../GameObjectsMasks')

class Map {

    constructor({ game }) {

        this.id = uuid.v4()

        this.tileSize = 2
        this.doubleTileSize = this.tileSize * 2
        this.halfTileSize = this.tileSize / 2

        this.game = game
        const tileLayer = arena.layers.filter(x => x.type === 'tilelayer')
        this.layers = tileLayer.map(({ name, data, encoding, height, width }) => {
            let dataBuffered = Buffer.from(data, encoding)
            let x = -1
            let y = 0
            const tiles = _.chunk(dataBuffered.toJSON().data, 4)
            return tiles.map(([tile]) => {
                x += 1
                if(x >= width) {
                    x = 0
                    y += 1
                }
                return {
                    id: tile, 
                    position: {
                        x: (x * this.doubleTileSize) - this.halfTileSize,
                        y: (y * this.doubleTileSize) - this.halfTileSize
                    }
                }
            })
        })

        this.tilesets = arena.tilesets.map(tileset => tileset.tiles)[0]
        this.tiles = this.layers.reduce((previous, tiles) => {
            return [
                ...previous, 
                ...tiles.map(tile => {
                    const tileData = this.tilesets.find(x => x.id + 1 == tile.id)
                    if(tileData) return { ...tile, ...tileData }
                    else return { ...tile, type: 'Walkable' }
                })
            ]
        }, [])

        this.data = this.tiles.filter(x => x.type !== 'Walkable')
        this.physicsBodies = this.data.map(tile => {
            const physicsBody = game.physicsWorld.createBody({
                type: 'static',
                position: planck.Vec2(
                    tile.position.x,
                    tile.position.y
                ),
            })

            let filterCategoryBits
            let filterMaskBits
            switch (tile.type) {
                case 'RedBlock':
                    filterCategoryBits = GameObjectsMasks.RED_BLOCK
                    filterMaskBits = GameObjectsMasks.EVERYTHING ^ GameObjectsMasks.RED_PLAYER
                    break
                case 'GreenBlock':
                    filterCategoryBits = GameObjectsMasks.GREEN_BLOCK
                    filterMaskBits = GameObjectsMasks.EVERYTHING ^ GameObjectsMasks.GREEN_PLAYER
                    break
                default:
                    filterCategoryBits = GameObjectsMasks.GROUND
                    filterMaskBits = GameObjectsMasks.EVERYTHING
            }
            physicsBody.createFixture({
                shape: planck.Box(this.tileSize, this.tileSize, planck.Vec2(0, 0), 0),
                filterCategoryBits,
                filterMaskBits,
            })

            return physicsBody
        })

        const objects = arena.layers.filter(x => x.type === 'objectgroup')[0]
        this.greenSpawn = {}
        this.redSpawn = {}
        objects.objects.forEach(obj => {

            const spawnObject = {
                name: obj.name,
                x: obj.x / 64,
                y: obj.y / 64,
                height: obj.height / 64,
                width: obj.width / 64,
                tileSize: this.doubleTileSize,
                getRandomPosition: function() {
                    return {
                        x: (this.x + (Math.random() * (this.width - 1))) * this.tileSize,
                        y: (this.y + (Math.random() * (this.height - 1))) * this.tileSize,
                    }
                }
            }

            switch (obj.name) {
                case 'GreenSpawn':
                    this.greenSpawn = spawnObject
                    break
                case 'RedSpawn':
                    this.redSpawn = spawnObject
                    break
            }
        })

    }

}

module.exports = Map