class Tetrimino {
    matrix: Sprite[][]
    shapeID: number
    rotation: number
    row: number
    col: number

    constructor (shape: number) {
        this.shapeID = shape
        this.rotation = 0
        this.matrix = []
        this.row = 0
        this.col = 3
        let max = 3
        let i = 0
        if (this.shapeID == 0 || this.shapeID == 1) { max = 4 }
        for (let r = 0; r < max; r ++) {
            let row: Sprite[] = []
            for (let c = 0; c < max; c ++) {
                if (shapes[this.shapeID][this.rotation][i] % max == c && Math.floor(shapes[this.shapeID][this.rotation][i] / max) == r) {
                    let tmpSprite = sprites.create(colors[this.shapeID])
                    tmpSprite.setPosition((c + this.col) * 5 + X0, (r + this.row) * 5 + Y0)
                    row.push(tmpSprite)
                    i++
                } else {
                    row.push(null)
                }
            }
            this.matrix.push(row)
        }
    }

    moveBy (dc: number, dr: number) {
        if (!checkCollision(dc, dr, 0)) {
            this.col = this.col + dc
            this.row = this.row + dr
            for (let r = 0; r < this.matrix.length; r++) {
                for (let c = 0; c < this.matrix.length; c++) {
                    if (this.matrix[r][c] != null) {
                        this.matrix[r][c].setPosition((this.col + c) * 5 + X0, (this.row + r) * 5 + Y0)
                    }
                }
            }
        }
    }

    rotateBy (rotation: number) {
        let r = this.rotation
        r += rotation
        if (r > 3) { r = 0 }
        if (r < 0) { r = 3 }
        this.rotation = r
        let i = 0
        for (let r = 0; r < this.matrix.length; r++) {
            for (let c = 0; c < this.matrix.length; c++) {
                if (this.matrix[r][c] != null) {
                    this.matrix[r][c].destroy()
                    this.matrix[r][c] = null
                }
                if (shapes[this.shapeID][this.rotation][i] % this.matrix.length == c && Math.floor(shapes[this.shapeID][this.rotation][i] / this.matrix.length) == r) {
                    let tmpSprite = sprites.create(colors[this.shapeID])
                    tmpSprite.setPosition((this.col + c) * 5 + X0, (this.row + r) * 5 + Y0)
                    this.matrix[r][c] = tmpSprite 
                    i++
                }
            }
        }
    }
}

class Bag {

    contents: number[]

    constructor () {
        this.contents = []
        let full = false
        while (!full) {
            let rnd = Math.randomRange(0, 6)
            if (this.contents.indexOf(rnd) == -1) {
                this.contents.push(rnd)
            }
            if (this.contents.length == 7) {
                full = true
            }
        }
    }

    deal (): number {
        if (this.contents.length > 0) {
            return this.contents.pop()
        } else {
            let full = false
            while (!full) {
                let rnd = Math.randomRange(0, 6)
                if (this.contents.indexOf(rnd) == -1) {
                    this.contents.push(rnd)
                }
                if (this.contents.length == 7) {
                    full = true
                }
            }
            return this.contents.pop()
        }
    }

}

function lock() {
    if (t.row == -1) {
        game.over(false)
    }
    for (let r = 0; r < t.matrix.length; r ++) {
        for (let c = 0; c < t.matrix.length; c ++) {
            if (t.matrix[r][c] != null) {
                matrix[r + t.row][c + t.col] = t.matrix[r][c]
                console.log("Moved t.matrix[" + r + ", " + c + "] >> matrix[" + (r + t.row) + ", " + (c + t.col) + "]")
            } 
        }
    }
    clearRows()
    t = new Tetrimino(b.deal())
}

function clearRows () {
    for (let r = 0; r < 20; r ++) {
        r += 2
        if (matrix[r].indexOf(null) == -1) {
            for (let tile of matrix[r]) {
                tile.destroy()
            }
            matrix.removeAt(r)
            let emptyRow: Sprite[] = []
            for (let c = 0; c < 10; c++) {
                emptyRow.push(null)
            }
            matrix.unshift(emptyRow)
        }
    }
} 

function checkCollision (inc_col: number, inc_row: number, inc_rot: number): boolean {
    let result = false
    for (let r = 0; r < t.matrix.length; r++) {
        for (let c = 0; c < t.matrix.length; c++) {
            if (t.matrix[r][c] != null) {
                if (inc_col == -1) {
                    if (c + inc_col + t.col < 0 || (c + inc_col + t.col > 0 && matrix[c + inc_col + t.col][r + inc_row + t.row] != null)) {
                        result = true
                    }
                } else if (inc_col == 1) {
                    if (c + inc_col + t.col > 9 || (c + inc_col + t.col < 9 && matrix[c + inc_col + t.col][r + inc_row + t.row] != null)) {
                        result = true
                    }
                } else if (inc_row == 1) {
                    if (r + inc_row + t.row < 21 && matrix[r + inc_row + t.row][c + inc_col + t.col] != null) {
                        lock()
                    } else if (r + inc_row + t.row == 21) {
                        lock()
                    }
                } else if (inc_rot != 0) {
                    // kick ??
                    let i = 0
                    let ghostMatrix: boolean[][] = []
                    for (let r = 0; r < t.matrix.length; r++) {
                        let row: boolean[] = []
                        for (let c = 0; c < t.matrix.length; c++) {
                            if (shapes[t.shapeID][t.rotation + inc_rot][i] % t.matrix.length == c && Math.floor(shapes[t.shapeID][t.rotation + inc_rot][i] / t.matrix.length) == r) {
                                row.push(true)
                                i++
                            } else row.push(false)
                        }
                        ghostMatrix.push(row)
                    }
                }
            }
        }
    }
    console.log("----------------")
    return result
}

const shapes = [
    [[8, 9, 10, 11], [2, 6, 10, 14], [8, 9, 10, 11], [2, 6, 10, 14]],
    [[5, 6, 9, 10], [5, 6, 9, 10], [5, 6, 9, 10], [5, 6, 9, 10]],
    [[0, 1, 2, 5], [1, 4, 6, 7], [0, 3, 4, 5], [1, 2, 4, 7]],
    [[3, 4, 5, 6], [0, 1, 4, 7], [2, 3, 4, 5], [1, 4, 7, 8]],
    [[4, 5, 6, 7], [1, 4, 5, 8], [4, 5, 6, 7], [1, 4, 5, 8]],
    [[3, 4, 5, 7], [1, 3, 4, 7], [1, 3, 4, 5], [1, 4, 5, 7]],
    [[3, 4, 7, 8], [2, 4, 5, 7], [3, 4, 7, 8], [2, 4, 5, 7]],
]

const colors: Image[] = [
    assets.image`color0`,
    assets.image`color1`,
    assets.image`color2`,
    assets.image`color3`,
    assets.image`color4`,
    assets.image`color5`,
    assets.image`color6`
]

const X0 = 58
const Y0 = 8

let matrix: Sprite[][] = []
for (let r = 0; r < 22; r ++) {
    let row: Sprite[] = []
    for (let c = 0; c < 10; c ++) {
        row.push(null)
    }
    matrix.push(row)
}


scene.setBackgroundImage(assets.image`game`)

let b = new Bag()
let t = new Tetrimino(b.deal())

controller.down.onEvent(ControllerButtonEvent.Repeated, function() {
    t.moveBy(0, 1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    t.moveBy(0, 1)
})

controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    t.moveBy(-1, 0)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    t.moveBy(-1, 0)
})

controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    t.moveBy(1, 0)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    t.moveBy(1, 0)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    t.rotateBy(1)
})
