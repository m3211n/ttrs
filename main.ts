class Bag {
    private preview: Sprite[]
    private contents: number[]

    constructor() {
        let full = false
        this.contents = []
        this.fill()
        this.preview = []
        for (let n = 0; n < NEXT_PIECES; n++) {
            this.preview.push(sprites.create(image.create(4 * NEXT_CELL_SIZE, 4 * NEXT_CELL_SIZE)))
            this.preview[n].setPosition(134, 43 + n * (this.preview[0].height + NEXT_CELL_SIZE))
        }
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
        for (let n = 0; n < NEXT_PIECES; n++) {
            this.preview[n].image.fill(0)
            let piece = buildPieceMatrix(this.contents[n], 0)
            for (let r = 0; r < piece.length; r++) {
                for (let c = 0; c < piece.length; c++) {
                    if (piece[r][c] != 0) {
                        this.preview[n].image.fillRect(c * NEXT_CELL_SIZE, r * NEXT_CELL_SIZE, NEXT_CELL_SIZE, NEXT_CELL_SIZE, tetris_colors[this.contents[n] + 1])
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

class Tetrimino {
    s: Sprite
    colors: number[][]
    rotation: number
    shapeID: number
    r: number
    c: number
    h: number
    r_hard_drop: number

    private ghost_piece: Sprite

    constructor() {
        this.shapeID = bag.deal()
        this.rotation = 0
        this.r = 0
        this.c = (this.shapeID == 3) ? 4 : 3
        let size = (this.shapeID == 3) ? 2 : ((this.shapeID == 0) ? 4 : 3)
        this.s = sprites.create(image.create(size * CELL_SIZE, size * CELL_SIZE))
        this.ghost_piece = sprites.create(image.create(size * CELL_SIZE, size * CELL_SIZE))
        this.updateSprite()
        this.locateAt(this.r, this.c)
    }

    build(r?: number): number[][] {
        let rotation = r ? r : this.rotation
        this.h = heights[this.shapeID][this.rotation]
        return buildPieceMatrix(this.shapeID, rotation)
    }

    updateSprite() {
        this.colors = this.build()
        let n = this.colors.length
        this.s.image.fill(0)
        this.ghost_piece.image.fill(0)
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.colors[r][c] != 0) {
                    this.s.image.drawImage(tiles_images[this.shapeID], c * CELL_SIZE, r * CELL_SIZE)
                    this.ghost_piece.image.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE, 12)
                    this.ghost_piece.image.fillRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 0)
                }
            }
        }
    }

    bottomSonar() {
        let lowest_row = MATRIX_HEIGHT
        for (let c = 0; c < this.colors.length; c++) {
            let occupied = false
            let r = this.r + this.h
            while (!occupied && r < lowest_row) {
                if (matrix.colors[r][c + this.c] != 0) {
                    occupied = true
                } else {
                    r++
                }
            }
            if (r < lowest_row) {
                lowest_row = r
            }
        }
        this.r_hard_drop = lowest_row - this.h
    }

    locateAt(r: number, c: number) {
        this.r = r
        this.c = c
        this.bottomSonar()
        this.s.setPosition(x0 + (this.c * CELL_SIZE + this.s.width / 2), y0 + (this.r * CELL_SIZE + this.s.height / 2))
        this.ghost_piece.setPosition(x0 + (this.c * CELL_SIZE + this.ghost_piece.width / 2), y0 + (this.r_hard_drop * CELL_SIZE + this.ghost_piece.height / 2))
    }

    respawn() {
        this.s.destroy()
        this.ghost_piece.destroy()
        this.shapeID = bag.deal()
        this.rotation = Rotation.Zero
        this.r = (this.shapeID == 0) ? -1 : 0
        this.c = (this.shapeID == 3) ? 4 : 3
        this.colors = this.build()
        this.s = sprites.create(image.create(this.colors.length * CELL_SIZE, this.colors.length * CELL_SIZE))
        this.ghost_piece = sprites.create(image.create(this.colors.length * CELL_SIZE, this.colors.length * CELL_SIZE))
        this.updateSprite()
        this.locateAt(this.r, this.c)
    }

    wallKick(x: number, y: number) {
        let new_x = this.c + x
        let new_y = this.r - y
        this.locateAt(new_x, new_y)
    }

    strafe(inc: number) {
        if (checkCollision(this.r, this.c + inc)) {
            this.locateAt(this.r, this.c + inc)
        }
    }

    drop(hard: boolean) {
        if (hard) {
            this.r = this.r_hard_drop
            score += ((this.r_hard_drop - this.r) * 2)
        } else {
            this.r++
            score++
        }
        if (this.r == this.r_hard_drop) {
            lock()
        }
        updateStats()
    }

    rotate(cw: boolean) {
        if (this.shapeID != 3) {
            let next_rotation = cw ? ((this.rotation == 3) ? 0 : this.rotation + 1) : ((this.rotation == 0) ? 3 : this.rotation - 1)
            // check if wall kicks are needed
            let rotated_colors = this.build(next_rotation)
            let cantRotate = checkCollision(this.r, this.c, rotated_colors)
            let rotation = this.rotation * 2 + (cw ? 0 : 1)
            let testID = 1
            while (!cantRotate && testID <= 4) {
                if (this.shapeID != 0) {
                    cantRotate = checkCollision(this.r - wall_kick_data[rotation][testID][1], this.c + wall_kick_data[rotation][testID][0], rotated_colors)
                }
                testID++
            }
            if (!cantRotate) {
                if (testID > 1) {
                    this.wallKick(wall_kick_data[rotation][testID][0], wall_kick_data[rotation][testID][1])
                }
                this.rotation = next_rotation
                this.updateSprite()
            }
        }
    }

}

class Matrix {
    s: Sprite
    colors: number[][]
    t: Tetrimino
    x0: number
    y0: number

    constructor() {
        this.colors = []
        for (let r = 0; r < 22; r++) {
            this.colors.push([])
            for (let c = 0; c < 10; c++) {
                this.colors[r].push(0)
            }
        }
        this.s = sprites.create(image.create(this.colors[0].length * CELL_SIZE, this.colors.length * CELL_SIZE))
        this.s.setPosition(80, 60)
        this.s.image.fill(0)
    }

    redraw() {
        this.s.image.fill(0)
        for (let r = 0; r < 22; r++) {
            for (let c = 0; c < 10; c++) {
                if (this.colors[r][c] != 0) {
                    this.s.image.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE, tetris_colors[this.colors[r][c]])
                }
            }
        }
    }

    clearRows() {
        let lc = 0
        for (let r = 2; r < 22; r++) {
            if (this.colors[r].indexOf(null) == -1) {
                lc++
                lines++
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
                case 1: score += (100 * level); break
                case 2: score += (300 * level); break
                case 3: score += (500 * level); break
                case 4: score += (800 * level)
            }
            // UPDATE LEVEL
            if (lines >= 10 * level) {
                levelUp()
            }
            updateStats()
        }
    }

    lock() {
    }
}

/*

function wallKickData(shapeID: number, testID: number, rotation: number): [number, number] {

    const z_r = (this.t.rotation == Rotation.Zero && next == Rotation.Right)
    const r_z = (this.t.rotation == Rotation.Right && next == Rotation.Zero)
    const r_t = (this.t.rotation == Rotation.Right && next == Rotation.Two)
    const t_r = (this.t.rotation == Rotation.Two && next == Rotation.Right)
    const t_l = (this.t.rotation == Rotation.Two && next == Rotation.Left)
    const l_t = (this.t.rotation == Rotation.Left && next == Rotation.Two)
    const l_z = (this.t.rotation == Rotation.Left && next == Rotation.Zero)
    const z_l = (this.t.rotation == Rotation.Zero && next == Rotation.Left)

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
                } else if (this.t.rotation == Rotation.Right) {
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
    let result = this.checkCollision(this.t.r - y_k, this.t.c + x_k, this.t.build(next))
    return [
        result, y_k, x_k
    ]
}

*/

function lock() {
    if (tetrimino.r == 0) {
        game.over(false)
        clearInterval(tickID)
    }
    let n = tetrimino.colors.length
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (tetrimino.colors[r][c] != 0) {
                matrix.colors[r + tetrimino.r][c + tetrimino.c] = tetrimino.colors[r][c]
            }
        }
    }
    matrix.clearRows()
    matrix.redraw()
    tetrimino.respawn()
    tetrimino.updateSprite()
}

function checkCollision(next_r: number, next_c: number, cells?: number[][]): boolean {
    if (!cells && next_c == tetrimino.c && next_r < tetrimino.r_hard_drop) {
        return false
    } else {
        if (!cells) {
            cells = tetrimino.colors
        }

        let result = false
        let n = cells.length
        let r = 0

        while (r < n && !result) {
            let c = 0
            while (c < n && !result) {
                if (cells[r][c] != 0) {
                    if ((r + next_r < 0) || (r + next_r > 21) || (typeof matrix.colors[r + next_r][c + next_c] === "undefined") || (r + next_r <= 21 && matrix.colors[r + next_r][c + next_c] != 0 && matrix.colors[r + next_r][c + next_c] < 21)) {
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
                matrix[r].push(shapeID + 1)
                i++
            } else {
                matrix[r].push(0)
            }
        }
    }
    return matrix
}

const tetris_colors = [0, 9, 8, 4, 5, 7, 10, 2]

const tiles_images: Image[] = [
    assets.image`color_0`,
    assets.image`color_1`,
    assets.image`color_2`,
    assets.image`color_3`,
    assets.image`color_4`,
    assets.image`color_5`,
    assets.image`color_6`,
]

const heights = [
    [2, 4, 3, 4],
    [2, 3, 3, 3],
    [2, 3, 3, 3],
    [2, 2, 2, 2],
    [2, 3, 3, 3],
    [2, 3, 3, 3],
    [2, 3, 3, 3]
]

enum Rotation {
    Zero = 0,
    Right = 1,
    Two = 2,
    Left = 3
}

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

let level: number = 1
let score: number = 0
let gravity: number = 1
let lines: number = 0
let highscore: number = 0

const MATRIX_WIDTH = 10
const MATRIX_HEIGHT = 22
const CELL_SIZE = 5
const NEXT_CELL_SIZE = 5
const NEXT_PIECES = 3
const STAT_FONT_SIZE = 5

let x0 = 80 - MATRIX_WIDTH * CELL_SIZE / 2
let y0 = 60 - MATRIX_HEIGHT * CELL_SIZE / 2

let bag = new Bag()
let matrix = new Matrix()
let tetrimino = new Tetrimino()

// -------- UI --------

let bg = image.create(160, 128)
bg.fillRect(53, 13, 54, 104, 11)          // Matrix
bg.fillRect(55, 15, 50, 100, 0)
scene.setBackgroundImage(bg)

// -------- STATS --------

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

// ---- AUTO DROP / GRAVITY ----

function autoMove() {
    tetrimino.locateAt(tetrimino.r + 1, tetrimino.c)
}

let tickID = setInterval(autoMove, 1000)

function levelUp() {
    level++
    gravity = Math.pow(0.8 - ((level - 1) * 0.007), level - 1)
    clearInterval(tickID)
    tickID = setInterval(autoMove, 1000 * gravity)
}

// -------- CONTROLLER --------

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.rotate(true)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.rotate(false)
})

controller.down.onEvent(ControllerButtonEvent.Repeated, function () {
    tetrimino.drop(false)
})

controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    tetrimino.strafe(-1)
})

controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    tetrimino.strafe(1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.drop(false)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.strafe(-1)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.strafe(1)
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    tetrimino.drop(true)
})
