class Bag {
    preview: Sprite[]
    contents: number[]

    constructor() {
        let full = false
        this.contents = []
        while (!full) {
            let rnd = Math.randomRange(0, 6)
            if (this.contents.indexOf(rnd) == -1) {
                this.contents.push(rnd)
            }
            if (this.contents.length == 7) {
                full = true
            }
        }

        this.preview = []
        for (let n = 0; n < 3; n++) {
            let max = (this.contents[n] == 0) ? 4 : ((this.contents[n] == 3) ? 2 : 3)
            this.preview.push(sprites.create(image.create(4 * NEXT_CELL_SIZE, 4 * NEXT_CELL_SIZE)))
            this.preview[n].setPosition(134, 43 + n * (this.preview[0].height + NEXT_CELL_SIZE))
            let i = 0
            for (let r = 0; r < max; r++) {
                for (let c = 0; c < max; c++) {
                    if (shapes[this.contents[n]][i] % max == c && Math.floor(shapes[this.contents[n]][i] / max) == r) {
                        this.preview[n].image.fillRect(c * NEXT_CELL_SIZE, r * NEXT_CELL_SIZE, NEXT_CELL_SIZE, NEXT_CELL_SIZE, this.contents[n] + 1)
                        i++
                    }
                }
            }
        }
    }

    deal(): number {
        let next = this.contents.shift()
        if (this.contents.length < 3) {
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

        for (let n = 0; n < 3; n++) {
            let max = (this.contents[n] == 0) ? 4 : ((this.contents[n] == 3) ? 2 : 3)
            this.preview[n].image.fill(0)
            let i = 0
            for (let r = 0; r < max; r++) {
                for (let c = 0; c < max; c++) {
                    if (shapes[this.contents[n]][i] % max == c && Math.floor(shapes[this.contents[n]][i] / max) == r) {
                        this.preview[n].image.fillRect(c * NEXT_CELL_SIZE, r * NEXT_CELL_SIZE, NEXT_CELL_SIZE, NEXT_CELL_SIZE, this.contents[n] + 1)
                        i++
                    }
                }
            }
        }
        return next
    }
}

class Tetrimino {
    colors: number[][]
    piece: Sprite
    rotation: number
    shapeID: number
    r: number
    c: number
    r_hard_drop: number

    private ghost_piece: Sprite

    constructor(shape: number) {
        this.shapeID = shape
        this.colors = []
        this.rotation = 0 
        this.r = (shape == 0) ? -1 : 0
        this.c = (shape == 3) ? 4 : 3
        let max = (shape == 0) ? 4 : ((shape == 3) ? 2 : 3)
        let i = 0
        for (let r = 0; r < max; r++) {
            this.colors.push([])
            for (let c = 0; c < max; c++) {
                if (shapes[shape][i] % max == c && Math.floor(shapes[shape][i] / max) == r) {
                    this.colors[r].push(shape)
                    i++
                } else {
                    this.colors[r].push(null)
                }
            }
        }
        this.piece = sprites.create(image.create(max * CELL_SIZE, max * CELL_SIZE))
        this.ghost_piece = sprites.create(image.create(max * CELL_SIZE, max * CELL_SIZE))
    }

    update() {
        let n = this.colors.length
        
        if (this.piece.image.width != n * CELL_SIZE) {
            this.piece.destroy()
            this.ghost_piece.destroy()
            this.piece = sprites.create(image.create(n * CELL_SIZE, n * CELL_SIZE))
            this.ghost_piece = sprites.create(image.create(n * CELL_SIZE, n * CELL_SIZE))
        }

        this.piece.image.fill(0)
        this.ghost_piece.image.fill(0)
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.colors[r][c] != null) {
                    this.piece.image.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE, this.shapeID + 1)
                    this.piece.image.drawLine(c * CELL_SIZE + 1, r * CELL_SIZE + 1, c * CELL_SIZE + 3, r * CELL_SIZE + 1, this.shapeID + 8)
                    this.piece.image.drawLine(c * CELL_SIZE + 1, r * CELL_SIZE + 1, c * CELL_SIZE + 1, r * CELL_SIZE + 2, this.shapeID + 8)
                    this.ghost_piece.image.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE, 15)
                    this.ghost_piece.image.fillRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 0)
                }
            }
        }
        this.piece.setPosition(x0 + (this.c * CELL_SIZE + this.piece.width / 2), y0 + (this.r * CELL_SIZE + this.piece.height / 2))
        this.ghost_piece.setPosition(x0 + (this.c * CELL_SIZE + this.ghost_piece.width / 2), y0 + (this.r_hard_drop * CELL_SIZE + this.ghost_piece.height / 2))
    }

    reuse(shape: number) {
        this.shapeID = shape
        this.colors = []
        this.rotation = Rotation.Zero
        this.r = (shape == 0) ? -1 : 0
        this.c = (shape == 3) ? 4 : 3
        let max = (shape == 0) ? 4 : ((shape == 3) ? 2 : 3)
        let i = 0
        for (let r = 0; r < max; r++) {
            this.colors.push([])
            for (let c = 0; c < max; c++) {
                if (shapes[shape][i] % max == c && Math.floor(shapes[shape][i] / max) == r) {
                    this.colors[r].push(shape)
                    i++
                } else {
                    this.colors[r].push(null)
                }
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

    constructor(t: Tetrimino) {
        this.t = t
        this.colors = []
        for (let r = 0; r < 22; r ++) {
            this.colors.push([])
            for (let c = 0; c < 10; c ++) {
                this.colors[r].push(null)
            }
        }
        this.s = sprites.create(image.create(this.colors[0].length * CELL_SIZE, this.colors.length * CELL_SIZE))
        this.s.setPosition(80, 60)
        this.s.image.fill(0)
        this.bottomSonar()
        this.t.update()
    }

    bottomSonar() {
        // Bottom sonar
        let lowest_row = this.colors.length - 1
        for (let c = 0; c < this.t.colors.length; c ++) {
            let occupied = false
            let r = this.t.r
            while (!occupied && r < lowest_row) {
                if (this.colors[r][c + this.t.c] != null) {
                    occupied = true
                } else {
                    r++
                }
            }
            if (r < lowest_row) {
                lowest_row = r
            }
        }
        this.t.r_hard_drop = lowest_row
    }

    redraw() {
        this.s.image.fill(0)
        for (let r = 0; r < 22; r++) {
            for (let c = 0; c < 10; c++) {
                if (this.colors[r][c] != null) {
                    this.s.image.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE, this.colors[r][c] + 1)
                }
            }
        }
    }

    hardDrop() {
        score += ((this.t.r_hard_drop - this.t.r) * 2)
        this.t.r = this.t.r_hard_drop
        this.bottomSonar()
        this.t.update()
        this.lock()
        updateStats()
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

    rotate(cw: boolean) {
        if (this.t.shapeID != 3) {
            // create the rotated copy of the tetrimino
            let n = this.t.colors.length
            let tm = []
            let tm2 = []
            for (let r = 0; r < n; r++) {
                tm2.push([])
                for (let c = 0; c < n; c++) {
                    tm2[r].push(this.t.colors[r][c])
                }
            }
            if (cw) {
                // transpose
                for (let i = 0; i < n; i++) {
                    tm.push([])
                }
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        tm[j].push(this.t.colors[i][j])
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

            // check if wall kicks are needed
            let canRotate = false
            let x_k = 0
            let y_k = 0
            let testID = 1
            while (!canRotate && testID <= 5) {
                [canRotate, y_k, x_k] = this.canRotate(testID, this.t.rotation, cw, tm)
                testID++
            }
            if (canRotate) {
                this.t.colors = tm
                this.t.r = this.t.r - y_k // minus because kick adjustments are made considering the bottom left corner as 0, 0
                this.t.c = this.t.c + x_k
                // update the rotation property
                this.t.rotation = cw ? ((this.t.rotation == 3) ? 0 : this.t.rotation + 1) : ((this.t.rotation == 0) ? 3 : this.t.rotation - 1)
                this.bottomSonar()
                this.t.update()
            }
        }
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
            case CELL_SIZE:
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

    move(inc_r: number, inc_c: number) {
        let next_r = this.t.r + inc_r
        let next_c = this.t.c + inc_c
        if (!this.checkCollision(next_r, next_c)) {
            this.t.r = next_r
            this.t.c = next_c
        } else {
            if (this.t.r == this.t.r_hard_drop) {
                this.lock()
            }
        }
        if (inc_c != 0) {
            this.bottomSonar()
        }
        this.t.update()
    }

    checkCollision(next_r: number, next_c: number, cells? : number[][]): boolean {
        if (!cells && next_c == this.t.c && next_r < this.t.r_hard_drop) {
            return false
        } else {
            if (!cells) {
                cells = this.t.colors
            }

            let result = false
            let n = cells.length
            let r = 0

            while (r < n && !result) {
                let c = 0
                while (c < n && !result) {
                    if (cells[r][c] != null) {
                        if ((r + next_r < 0) || (r + next_r > 21) || (typeof this.colors[r + next_r][c + next_c] === "undefined") || (r + next_r <= 21 && this.colors[r + next_r][c + next_c] != null && this.colors[r + next_r][c + next_c] < 21)) {
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
            clearInterval(tickID)
        }
        let n = this.t.colors.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.t.colors[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.colors[r][c]
                }
            }
        }
        this.clearRows()
        this.redraw()
        this.t.reuse(bag.deal())
        this.bottomSonar()
        this.t.update()
    }
}



function updateStats() {

    sScore.setText(score.toString())
    sScore.setPosition(5 + sScore.width / 2, 22 + sScore.height / 2)
    sScore.setMaxFontHeight(8)

    sLevel.setText(level.toString())
    sLevel.setPosition(5 + sLevel.width / 2, 47 + sLevel.height / 2)
    sLevel.setMaxFontHeight(8)

    sLines.setText(lines.toString())
    sLines.setPosition(5 + sLines.width / 2, 72 + sLines.height / 2)
    sLines.setMaxFontHeight(8)

    sHighscore.setText(highscore.toString())
    sHighscore.setPosition(5 + sHighscore.width / 2, 97 + sHighscore.height / 2)
    sHighscore.setMaxFontHeight(8)

}

const shapes = [
    [4, 5, 6, 7], 
    [0, 3, 4, 5], 
    [2, 3, 4, 5], 
    [0, 1, 2, 3], 
    [1, 2, 3, 4], 
    [1, 3, 4, 5], 
    [0, 1, 4, 5]
]

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

const MATRIX_WIDTH = 10
const MATRIX_HEIGHT = 22
const CELL_SIZE = 5
const NEXT_CELL_SIZE = 5

let x0 =  80 - MATRIX_WIDTH * CELL_SIZE / 2
let y0 = 60 - MATRIX_HEIGHT * CELL_SIZE / 2

let bag = new Bag()
let tetrimino = new Tetrimino(bag.deal())
let matrix = new Matrix(tetrimino)

// -------- UI --------

let bg = image.create(160, 128)
bg.fillRect(53, 13, 54, 104, 15)          // Matrix
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

let sScore = textsprite.create("0", 0, 8)
let sLevel = textsprite.create("0", 0, 8)
let sLines = textsprite.create("0", 0, 8)
let sHighscore = textsprite.create("0", 0, 8)

updateStats()

// ---- AUTO DROP / GRAVITY ----

function autoMove() {
    matrix.move(1, 0)
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
    matrix.move(1, 0)
})

controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    matrix.move(0, -1)
})

controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    matrix.move(0, 1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(1, 0)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(0, -1)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.move(0, 1)
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.hardDrop()
})

let i = img``
i.r