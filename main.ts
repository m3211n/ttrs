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
        let i = 0
        for (let r = 0; r < 4; r ++) {
            let row: Sprite[] = []
            for (let c = 0; c < 4; c ++) {
                if (shapes[this.shapeID][this.rotation][i] % 4 == c && Math.floor(shapes[this.shapeID][this.rotation][i]/4) == r) {
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
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (this.matrix[r][c] != null) {
                        this.matrix[r][c].setPosition((this.col + c) * 5 + X0, (this.row + r) * 5 + Y0)
                    }
                }
            }
        }
    }

    rotateBy (rotation: number) {
        this.rotation = rotation
        let i = 0
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.matrix[r][c] != null) {
                    this.matrix[r][c].destroy()
                    this.matrix[r][c] = null
                }
                if (shapes[this.shapeID][this.rotation][i] % 4 == c && Math.floor(shapes[this.shapeID][this.rotation][i] / 4) == r) {
                    let tmpSprite = sprites.create(colors[this.shapeID])
                    tmpSprite.setPosition((this.col + c) * 5 + X0, (this.row + r) * 5 + Y0)
                    this.matrix[r][c] = tmpSprite 
                    i++
                }
            }
        }
    }
}

function lock() {
    for (let r = 0; r < 4; r ++) {
        for (let c = 0; c < 4; c ++) {
            if (t.matrix[r][c] != null) {
                matrix[r + t.row][c + t.col] == t.matrix[r][c]
            } 
        }
    }
    t = new Tetrimino(5)
}

function checkCollision (inc_col: number, inc_row: number, inc_rot: number): boolean {
    let ghostMatrix: boolean[][] = []
    let result = false
    let i = 0
    for (let r = 0; r < 4; r ++) {
        let row: boolean[] = []
        for (let c = 0; c < 4; c ++) {
            if (shapes[t.shapeID][t.rotation + inc_rot][i] % 4 == c && Math.floor(shapes[t.shapeID][t.rotation + inc_rot][i] / 4) == r) {
                row.push(true)
                i++
            } else row.push(false)
        }
        ghostMatrix.push(row)
    }
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (ghostMatrix[c][r]) {
                if (inc_col == -1) {
                    if (c + inc_col + t.col < 0 || (c + inc_col + t.col > 0 && matrix[c + inc_col + t.col][r + inc_row + t.row] != null)) {
                        result = true
                    }
                } else if (inc_col == 1) {
                    if (c + inc_col + t.col > 9 || (c + inc_col + t.col < 9 && matrix[c + inc_col + t.col][r + inc_row + t.row] != null)) {
                        result = true
                    }
                } else if (inc_row == 1) {
                    if (r + inc_row + t.row > 22 || (r + inc_row + t.row < 22 && matrix[c + inc_col + t.col][r + inc_row + t.row] != null)) {
                        result = true
                        lock()
                    }
                } else if (inc_rot != 0) {
                    // kick ??
                }
            }
        }
    }
    return result
}

const shapes = [
    [[4, 5, 6, 7], [2, 6, 10, 14], [8, 9, 10, 11], [1, 5, 9, 13]],
    [[0, 4, 5, 6], [1, 2, 5, 9], [4, 5, 6, 10], [1, 5, 8, 9]],
    [[2, 4, 5, 6], [1, 5, 9, 10], [4, 5, 6, 8], [0, 1, 5, 9]],
    [[1, 2, 5, 6], [1, 2, 5, 6], [1, 2, 5, 6], [1, 2, 5, 6]],
    [[1, 2, 4, 5], [1, 5, 6, 10], [5, 6, 8, 9], [0, 4, 5, 9]],
    [[1, 4, 5, 6], [1, 5, 6, 9], [4, 5, 6, 9], [1, 4, 5, 9]],
    [[0, 1, 5, 6], [2, 5, 6, 9], [4, 5, 9, 10], [1, 4, 5, 8]]
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

let t = new Tetrimino(5)
checkCollision(1, 1, 1)

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