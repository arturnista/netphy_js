function moveTowards(current, target, increment) {
    
    let finalValue = target
    if(current > target) {
        finalValue = current - increment
        if(finalValue < target) finalValue = target
    } else if(current < target) {
        finalValue = current + increment
        if(finalValue > target) finalValue = target
    }

    return finalValue
}

function length(vector) {
    if(vector == null) throw new Error('Vector is undefined')

    return Math.abs(vector.x) + Math.abs(vector.y)
}

function normalize(vec) {
    if(vec == null) throw new Error('Vector is undefined')

    const tot = length(vec)
    if(tot === 0) return { x: 0, y: 0 }
    return {
        x: vec.x / tot,
        y: vec.y / tot,
    }
}


function sub(pos1, pos2) {
    if(pos1 == null) throw new Error('Position 1 is undefined')
    if(pos2 == null) throw new Error('Position 2 is undefined')

    return {
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y
    }
}

function vec2MoveTowards (current, target, value) {
    if(value < 0) value *= -1

    const currentNorm = normalize(current)
    const targetNorm = normalize(target)
    
    const norm = normalize(sub(targetNorm, currentNorm))

    let xToSum = Math.abs( norm.x * value )
    let yToSum = Math.abs( norm.y * value )

    let xFinal = target.x
    let yFinal = target.y
    
    if(current.x > target.x) {

        xFinal = current.x - xToSum
        if(xFinal < target.x) xFinal = target.x

    } else if(current.x < target.x) {

        xFinal = current.x + xToSum
        if(xFinal > target.x) xFinal = target.x

    }

    if(current.y > target.y) {

        yFinal = current.y - yToSum
        if(yFinal < target.y) yFinal = target.y

    } else if(current.y < target.y) {

        yFinal = current.y + yToSum
        if(yFinal > target.y) yFinal = target.y

    }

    return {
        x: xFinal,
        y: yFinal,
    }
}

module.exports = {
    moveTowards,
    vec2MoveTowards,
    normalize,
    length
}