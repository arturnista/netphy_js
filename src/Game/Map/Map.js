const uuid = require('uuid')
const _ = require('lodash')
const planck = require('planck-js')
const arena = require('./arena')

class Map {

    constructor({ game }) {

        this.id = uuid.v4()

        this.tileSize = 5
        this.doubleTileSize = this.tileSize * 2
        this.halfTileSize = this.tileSize / 2

        this.game = game
        this.layers = arena.layers.map(({ name, data, encoding, height, width }) => {
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

        this.data = this.tiles.filter(x => x.type === 'Ground')
        this.physicsBodies = this.data.map(tile => {
            const physicsBody = game.physicsWorld.createBody({
                type: 'static',
                position: planck.Vec2(
                    tile.position.x,
                    tile.position.y
                ),
            })
            physicsBody.createFixture({
                shape: planck.Box(this.tileSize, this.tileSize, planck.Vec2(0, 0), 0)
            })

            return physicsBody
        })

    }

}

module.exports = Map