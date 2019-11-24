// Helper:
// categoryBits = I am a...
// maskBits = I collide with...

module.exports = {
    DEFAULT:      1 << 0,
    GROUND:       1 << 1,
    RED_BLOCK:    1 << 2,
    GREEN_BLOCK:  1 << 3,
    RED_PLAYER:   1 << 4,
    GREEN_PLAYER: 1 << 5,
    LASER:        1 << 6,

    EVERYTHING:   0xFFFF // or 0xFFFF
}