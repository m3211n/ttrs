class Matrix {
    cells: Sprite[][]
    colors: number[][]
    t: Tetrimino

    constructor(t: Tetrimino) {
        this.t = t
        this.cells = []
        this.colors = []
        for (let r = 0; r < 22; r ++) {
            let row: Sprite[] = []
            let c_row: number[] = []
            for (let c = 0; c < 10; c ++) {
                let tmp_sprite = sprites.create(image.create(5, 5))
                tmp_sprite.setPosition(c * 5 + X0, r * 5 + Y0)
                row.push(tmp_sprite)
                c_row.push(null)
            }
            this.cells.push(row)
            this.colors.push(c_row)
        }
        this.respawn()
    }

    hardDrop() {
        this.clear()
        score += ((this.t.r_hard_drop - this.t.r) * 2)
        this.t.r = this.t.r_hard_drop
        this.lock()
        updateStats()
    }

    clear() {
        let n = this.t.cells.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c <= n; c++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = null
                }
            }
        }
    }

    respawn() {
        // Sonar
        let bottom = false
        let r_g = this.t.r
        while (!bottom) {
            r_g++
            bottom = this.checkCollision(r_g, this.t.c, this.t.cells)
        }

        this.t.r_hard_drop = r_g - 1

        let n = this.t.cells.length
        for (let r = 0; r < n; r ++) {
            for (let c = 0; c < n; c ++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.cells[r][c]
                }
            }
        }
        console.log(this.t.r_hard_drop)
        this.redraw()
    }

    redraw() {
        let img: Image
        for (let r = 0; r < 22; r ++) {
            for (let c = 0; c < 10; c ++) {
                if (this.colors[r][c] != null) {
                    if (this.colors[r][c] <= 6 ) {
                        img = colors[this.colors[r][c]]
                    } else { 
                        img = image.create(5, 5)
                        img.fill(this.colors[r][c] - 6)
                    }
                    this.cells[r][c].setImage(img)
                } else {
                    this.cells[r][c].setImage(image.create(5,5))
                }
            }
        }
    }

    clearRows() {
        let lc = 0
        for (let r = 2; r < 22; r++) {
            if (this.colors[r].indexOf(null) == -1) {
                lc ++
                lines ++
                this.colors.removeAt(r)
                let emptyRow: number[] = []
                for (let c = 0; c < 10; c++) {
                    emptyRow.push(null)
                }
                this.colors.unshift(emptyRow)
                this.redraw()
            }
        }
        if (lc != 0) {
            switch (lc) {
                case 1:
                    score += (100 * level)
                    break
                case 2:
                    score += (300 * level)
                    break
                case 3:
                    score += (500 * level) 
                    break
                case 4:
                    score += (800 * level)
            }

            // UPDATE LEVEL
            if (lines >= 10 * level) {
                levelUp()
            }

            updateStats()

        }
    }

    rotate(cw: boolean) {
        this.clear()
        // create the rotated copy of the tetrimino
        let n = this.t.cells.length
        let tm = []
        let tm2 = []

        for (let row of this.t.cells) {
            tm2.push(row)
        }
        
        if (cw) {
            // transpose
            for (let i = 0; i < n; i++) {
                tm.push([])
            }
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    tm[j].push(this.t.cells[i][j])
                }
            }
            // reverse
            for (let i = 0; i < n; i++) {
                tm[i].reverse()
            }
        } else {
            // reverse
            for (let i = 0; i < n; i++) {
                tm2[i].reverse()
            }
            // transpose
            for (let i = 0; i < n; i++) {
                tm.push([])
            }
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    tm[j].push(tm2[i][j])
                }
            }
        }
        console.log(tm2)
        console.log(this.t.cells)

        // check if wall kicks are needed
        let canRotate = false
        let x_k = 0
        let y_k = 0
        let testID = 1
        while (!canRotate && testID <= 5) {
            [canRotate, y_k, x_k] = this.canRotate(testID, this.t.rotation, cw, tm)
            testID ++
        }
        // if wall kicks not needed
        if (canRotate) {
            this.t.cells = tm
            this.t.r = this.t.r - y_k // minus because kick adjustments are made considering the bottom left corner as 0, 0
            this.t.c = this.t.c + x_k

            // update the rotation property
            if (cw) {
                if (this.t.rotation == Rotation.Zero) { 
                    this.t.rotation = Rotation.Right 
                } else if (this.t.rotation == Rotation.Right) {
                    this.t.rotation = Rotation.Two
                } else if (this.t.rotation == Rotation.Two) {
                    this.t.rotation = Rotation.Left
                } else {
                    this.t.rotation = Rotation.Zero
                }
            } else {
                if (this.t.rotation == Rotation.Zero) {
                    this.t.rotation = Rotation.Left
                } else if (this.t.rotation == Rotation.Left) {
                    this.t.rotation = Rotation.Two
                } else if (this.t.rotation == Rotation.Two) {
                    this.t.rotation = Rotation.Right
                } else {
                    this.t.rotation = Rotation.Zero
                }
            }
        }
        this.respawn()
    }

    canRotate(testID: number, rot: number, cw: boolean, rotatedCells: number[][]): [boolean, number, number] {

        const z_r = (rot == Rotation.Zero && cw)
        const r_z = (rot == Rotation.Right && !cw)
        const r_t = (rot == Rotation.Right && cw)
        const t_r = (rot == Rotation.Two && !cw)
        const t_l = (rot == Rotation.Two && cw)
        const l_t = (rot == Rotation.Left && !cw)
        const l_z = (rot == Rotation.Left && cw)
        const z_l = (rot == Rotation.Zero && !cw)

        let x_k = 0
        let y_k = 0

        switch (testID) {
            case 1:
                break
            case 2:
                if (this.t.shapeID == 0) {
                    if (z_r || l_z) { 
                        x_k = -2; 
                    } else if (r_z || t_l) {
                        x_k = 2;
                    } else if (r_t || z_l) {
                        x_k = -1;
                    } else {
                        x_k = 1;
                    }
                } else {
                    if (z_r || t_r || l_t || l_z) {
                        x_k = -1
                    } else {
                        x_k = 1
                    }
                }
                break
            case 3:
                if (this.t.shapeID == 0) {
                    if (z_r || l_t) {
                        x_k = 1
                    } else if (r_z || t_l) {
                        x_k = -1
                    } else if (r_t || z_l) {
                        x_k = 2;
                    } else {
                        x_k = -2;
                    }
                } else {
                    if (z_r || t_r) {
                        x_k = -1; y_k = 1
                    } else if (rot == Rotation.Right) {
                        x_k = 1; y_k = -1
                    } else if (t_l || z_l) {
                        x_k = 1; y_k = 1
                    } else {
                        x_k = -1; y_k = -1
                    }
                }
                break
            case 4:
                if (this.t.shapeID == 0) {
                    if (z_r || l_t) {
                        x_k = -2; y_k = -1
                    } else if (r_z || t_l) {
                        x_k = 2; y_k = 1
                    } else if (r_t || z_l) {
                        x_k = 2; y_k = -1
                    } else {
                        x_k = -2; y_k = 1
                    }
                } else {
                    if (z_r || t_r || t_l || z_l) {
                        y_k = -2
                    } else {
                        y_k = 2
                    }
                }
                break
            case 5:
                if (this.t.shapeID == 0) {
                    if (z_r || l_t) {
                        x_k = 1; y_k = 2
                    } else if (r_z || t_l) {
                        x_k = -1; y_k = -2
                    } else if (r_t || z_l) {
                        x_k = 2; y_k = -1
                    } else {
                        x_k = -2; y_k = 1
                    }
                } else {
                    if (z_r || t_r) {
                        x_k = -1; y_k = -2
                    } else if (r_z || r_t) {
                        x_k = 1; y_k = 2
                    } else if (t_l || z_l) {
                        x_k = 1; y_k = -2
                    } else {
                        x_k = -1; y_k = 2
                    }
                }
                break
        }
        let result = !(this.checkCollision(this.t.r - y_k, this.t.c + x_k, rotatedCells))
        return [
            result, y_k, x_k
        ]
    }

    move(vert: boolean, inc: number) {
        let next_r = vert ? this.t.r + inc : this.t.r
        let next_c = vert ? this.t.c : this.t.c + inc
        if (!this.checkCollision(next_r, next_c, this.t.cells)) {
            this.clear()
            this.t.r = next_r
            this.t.c = next_c
            this.respawn()
        } else {
            if (vert) {
                this.lock()
            }
        }
    }

    checkCollision(next_r: number, next_c: number, cells: number[][]): boolean {
        let result = false
        let n = cells.length
        let r = 0
        if (next_c == this.t.c && next_r < this.t.r_hard_drop) {
            return result
        } else {
            while (r < n && !result) {
                let c = 0
                while (c < n && !result) {
                    if (cells[r][c] != null) {
                        if ((r + next_r < 0) || (r + next_r > 21) || (typeof this.colors[r + next_r][c + next_c] === "undefined") || (r + next_r <= 21 && this.colors[r + next_r][c + next_c] > 6 && this.colors[r + next_r][c + next_c] < 21)) {
                            result = true
                        }
                    }
                    c++
                }
                r++
            }
            return result
        }
    }

    lock() {
        if (this.t.r == 0) {
            game.over(false)
        }

        let n = this.t.cells.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.cells[r][c] + 7
                }
            }
        }
        this.clearRows()
        this.redraw()
        this.t = new Tetrimino(bag.deal())
        this.respawn()
    }
}

class Tetrimino {
    cells: number[][]
    rotation: number
    shapeID: number 
    r: number
    c: number
    r_hard_drop: number

    constructor(shape: number) {
        this.shapeID = shape
        this.cells = []
        this.rotation = Rotation.Zero
        this.r = (shape == 0) ? -1 : 0
        this.c = (shape == 3) ? 4 : 3 
        let max = (shape == 0) ? 4 : ((shape == 3) ? 2 : 3)
        let i = 0
        for (let r = 0; r < max; r ++) {
            let row: number[] = []
            for (let c = 0; c < max; c ++) {
                if (shapes[shape][i] % max == c && Math.floor(shapes[shape][i] / max) == r) {
                    row.push(shape)
                    i++
                } else {
                    row.push(null)
                }
            }
            this.cells.push(row)
        }
    }
}

class Bag {
    private preview: Sprite
    private contents: number[]

    constructor() {
        let full = false
        this.contents = []
        this.fill()
        this.preview = sprites.create(image.create(4 * NEXT_CELL_SIZE, 15 * NEXT_CELL_SIZE))
        this.preview.setPosition(134, 73)
    }

    private fill() {
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

    private updateQueue() {
        this.preview.image.fill(0)
        for (let n = 0; n < NEXT_PIECES; n++) {
            let piece = buildPieceMatrix(this.contents[n], 0)
            for (let r = 0; r < piece.length; r++) {
                for (let c = 0; c < piece.length; c++) {
                    if (piece[r][c] != null) {
                        this.preview.image.fillRect(c * NEXT_CELL_SIZE, (r + n * 5) * NEXT_CELL_SIZE, NEXT_CELL_SIZE, NEXT_CELL_SIZE, tetris_colors[this.contents[n]])
                    }
                }
            }
        }
    }

    deal(): number {
        let next = this.contents.shift()
        if (this.contents.length < NEXT_PIECES) {
            this.fill()
        }
        this.updateQueue()
        return next
    }
}

function buildPieceMatrix(shapeID: number, rotation: number): number[][] {
    let matrix: number[][] = []
    const shapes = [
        [[4, 5, 6, 7], [4, 5, 6, 7], [4, 5, 6, 7], [4, 5, 6, 7]],
        [[0, 3, 4, 5], [0, 3, 4, 5], [0, 3, 4, 5], [0, 3, 4, 5]],
        [[2, 3, 4, 5], [2, 3, 4, 5], [2, 3, 4, 5], [2, 3, 4, 5]],
        [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]],
        [[1, 3, 4, 5], [1, 3, 4, 5], [1, 3, 4, 5], [1, 3, 4, 5]],
        [[0, 1, 4, 5], [0, 1, 4, 5], [0, 1, 4, 5], [0, 1, 4, 5]]
    ]
    let max = (shapeID == 0) ? 4 : ((shapeID == 3) ? 2 : 3)
    let i = 0
    for (let r = 0; r < max; r++) {
        matrix.push([])
        for (let c = 0; c < max; c++) {
            if (shapes[shapeID][rotation][i] % max == c && Math.floor(shapes[shapeID][rotation][i] / max) == r) {
                matrix[r].push(shapeID)
                i++
            } else {
                matrix[r].push(null)
            }
        }
    }
    return matrix
}

function updateStats() {

    sScore.setText(score.toString())
    sScore.setPosition(5 + sScore.width / 2, 26 + sScore.height / 2)

    sLevel.setText(level.toString())
    sLevel.setPosition(5 + sLevel.width / 2, 51 + sLevel.height / 2)

    sLines.setText(lines.toString())
    sLines.setPosition(5 + sLines.width / 2, 77 + sLines.height / 2)

    sHighscore.setText(highscore.toString())
    sHighscore.setPosition(5 + sHighscore.width / 2, 101 + sHighscore.height / 2)

}

const tetris_colors = [9, 8, 4, 5, 7, 10, 2]

const wall_kick_data = [
    [[-1, 0], [-1, 1], [0, -2], [-1, -2]],  // 0 -> R
    [[1, 0], [1, 1], [0, -2], [1, -2]],     // 0 -> L

    [[1, 0], [1, -1], [0, 2], [1, 2]],      // R -> 2
    [[1, 0], [1, -1], [0, 2], [1, 2]],      // R -> 0

    [[1, 0], [1, 1], [0, -2], [1, -2]],     // 2 -> L
    [[-1, 0], [-1, 1], [0, -2], [-1, -2]],  // 2 -> R

    [[-1, 0], [-1, -1], [0, 2], [-1, 2]],   // L -> 0
    [[-1, 0], [-1, -1], [0, 2], [-1, 2]]    // L -> 2
]

const wall_kick_data_I = [
    [[-2, 0], [1, 0], [-2, -1], [1, 2]],    // 0 -> R
    [[-1, 0], [+2, 0], [-1, 2], [2, -1]],   // 0 -> L

    [[-1, 0], [2, 0], [-1, 2], [2, -1]],    // R -> 2
    [[2, 0], [-1, 0], [+2, +1], [-1, -2]],  // R -> 0

    [[2, 0], [-1, 0], [2, 1], [-1, -2]],    // 2 -> L
    [[1, 0], [-2, 0], [1, -2], [-2, -2]],   // 2 -> R

    [[1, 0], [-2, -0], [1, -2], [-2, 1]],   // L -> 0
    [[-2, 0], [1, 0], [-2, -1], [1, 2]]     // L -> 2
]

const shapes = [
    [4, 5, 6, 7], 
    [0, 3, 4, 5], 
    [2, 3, 4, 5], 
    [0, 1, 2, 3], 
    [1, 2, 3, 4], 
    [1, 3, 4, 5], 
    [0, 1, 4, 5]
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

const MATRIX_WIDTH = 10
const MATRIX_HEIGHT = 22
const CELL_SIZE = 5
const NEXT_CELL_SIZE = 5
const NEXT_PIECES = 3
const STAT_FONT_SIZE = 5

const X0 = 58
const Y0 = 8

enum Rotation {
    Zero = 0,
    Right = 1,
    Two = 2,
    Left = 3
}

let level: number = 1
let score: number = 0
let gravity: number = 1
let lines: number = 0
let highscore: number = 0

let bag = new Bag()
let tetrimino = new Tetrimino(bag.deal())
let matrix = new Matrix(tetrimino)

// -------- UI - MATRIX --------

let bg = image.create(160, 128)
bg.fillRect(53, 3, 54, 114, 11)          // Matrix
bg.fillRect(55, 5, 50, 110, 0)
scene.setBackgroundImage(bg)

// -------- UI - STATS --------

let sScoreTitle = sprites.create(assets.image`txt_score`)
let sLevelTitle = sprites.create(assets.image`txt_level`)
let sLinesTitle = sprites.create(assets.image`txt_lines`)
let sHighscoreTitle = sprites.create(assets.image`txt_hiscore`)
let sNextTitle = sprites.create(assets.image`txt_next`)

sScoreTitle.setPosition(18, 18)
sLevelTitle.setPosition(18, 43)
sLinesTitle.setPosition(18, 68)
sHighscoreTitle.setPosition(23, 93)
sNextTitle.setPosition(134, 18)

let sScore = textsprite.create("0", 0, 11)
sScore.setMaxFontHeight(STAT_FONT_SIZE)

let sLevel = textsprite.create("0", 0, 11)
sLevel.setMaxFontHeight(STAT_FONT_SIZE)

let sLines = textsprite.create("0", 0, 11)
sLines.setMaxFontHeight(STAT_FONT_SIZE)

let sHighscore = textsprite.create("0", 0, 11)
sHighscore.setMaxFontHeight(STAT_FONT_SIZE)

updateStats()

function autoMove() {
    matrix.move(true, 1)
}

let tickID = setInterval(autoMove, 1000)

function levelUp() {
    level++
    gravity = Math.pow(0.8 - ((level - 1) * 0.007), level - 1)
    clearInterval(tickID)
    tickID = setInterval(autoMove, 1000 * gravity)
}

// -------- CONTROLLER --------

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    matrix.rotate(true)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.rotate(false)
})

controller.down.onEvent(ControllerButtonEvent.Repeated, function() {
    matrix.move(true, 1)
})

controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    matrix.move(false, -1)
})

controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    matrix.move(false, 1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(true, 1)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(false, -1)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(false, 1)
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.hardDrop()
})