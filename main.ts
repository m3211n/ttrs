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
        let i = 0
        for (let r = 0; r < 4; r ++) {
            let row: Sprite[] = []
            for (let c = 0; c < 4; c ++) {
                if (shapes[this.shapeID][this.rotation][i] % 4 == c && Math.floor(shapes[this.shapeID][this.rotation][i]/4) == r) {
                    let tmpSprite = sprites.create(colors[this.shapeID])
                    tmpSprite.setPosition(c * 5, r * 5)
                    row.push(tmpSprite)
                    i++
                } else {
                    row.push(null)
                }
            }
            this.matrix.push(row)
        }
    }

    setPosition(col: number, row: number) {
        this.col = col
        this.row = row
        for (let r = 0; r < 4; r ++) {
            for (let c = 0; c < 4; c ++) {
                if (this.matrix[r][c] != null) {
                    this.matrix[r][c].setPosition((this.col + c) * 5 + X0, (this.row + r) * 5 + Y0) 
                }
            }
        }
    }

    setRotation (rotation: number) {
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

const X0 = 56
const Y0 = 8

scene.setBackgroundImage(assets.image`game`)

let t = new Tetrimino(5)
t.setPosition(3, 0)

controller.down.onEvent(ControllerButtonEvent.Repeated, function() {
    let c = t.col
    let r = t.row
    r++
    t.setPosition(c, r)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    let c = t.col
    let r = t.row
    r++
    t.setPosition(c, r)
})