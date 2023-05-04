class Matrix {
    cells: Sprite[][]
    cells_new: Sprite
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

            this.cells_new = sprites.create(image.create(this.colors[0].length * 5, this.colors.length * 5))
            this.cells_new.setPosition(80, 60)
            this.cells_new.image.fill(0)
        }
    }

    bottomSonar() {
        // Bottom sonar
        let bottom = false
        let r_g = this.t.r
        while (!bottom) {
            r_g++
            bottom = this.checkCollision(r_g, this.t.c, this.t.cells)
        }

        this.t.r_hard_drop = r_g - 1
    }

    redraw() {
        this.cells_new.image.fill(0)
        for (let r = 0; r < 22; r++) {
            for (let c = 0; c < 10; c++) {
                if (this.colors[r][c] != null) {
                    this.cells_new.image.fillRect(c * 5, r * 5, 5, 5, this.colors[r][c] + 1)
                }
            }
        }
    }

    hardDrop() {
        this.clear()
        score += ((this.t.r_hard_drop - this.t.r) * 2)
        this.t.r = this.t.r_hard_drop
        this.t.piece.setPosition(X0 + (this.t.c + 1) * 5, Y0 + (this.t.r + 1) * 5)
        this.lock()
        updateStats()
    }

    clear() {
        this.t.piece.setImage(image.create(this.t.cells.length * 5, this.t.cells.length * 5))
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
        let tm2 = this.t.cells
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
        this.t.update()
        this.bottomSonar()
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
            this.t.r = next_r
            this.t.c = next_c
            this.t.piece.setPosition(X0 + (this.t.c + 1) * 5, Y0 + (this.t.r + 1) * 5)
        } else {
            if (vert) {
                this.lock()
            }
        }
        this.bottomSonar()
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
        }

        let n = this.t.cells.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.cells[r][c]
                }
            }
        }
        this.clearRows()
        this.redraw()
        this.t.piece.destroy()
        this.t = new Tetrimino(bag.deal())
        this.t.update()
    }
}

class Tetrimino {
    cells: number[][]
    piece: Sprite
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
        this.piece = sprites.create(image.create(max * 5, max * 5))
        this.piece.setPosition(X0 + (this.c + 1) * 5, Y0 + (this.r + 1) * 5)
    }

    update() {
        let n = this.cells.length
        this.piece.setImage(image.create(n * 5, n * 5))
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.cells[r][c] != null) {
                    this.piece.image.fillRect(c * 5, r * 5, 5, 5, this.shapeID + 1)
                    this.piece.image.drawLine(c * 5 + 1, r * 5 + 1, c * 5 + 3, r * 5 + 1, this.shapeID + 8)
                    this.piece.image.drawLine(c * 5 + 1, r * 5 + 1, c * 5 + 1, r * 5 + 2, this.shapeID + 8)
                }
            }
        }
    }

    setPosition(x: number, y: number) {

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

// -------- UI --------

let bg = image.create(160, 128)
bg.fillRect(53, 13, 54, 104, 15)          // Matrix
bg.fillRect(55, 15, 50, 100, 0)          // Matrix
bg.fillRect(116, 14, 18, 54, 0)         // Next
scene.setBackgroundImage(bg)

// -------- STATS --------

let sScoreTitle = sprites.create(assets.image`txt_score`)
let sLevelTitle = sprites.create(assets.image`txt_level`)
let sLinesTitle = sprites.create(assets.image`txt_lines`)
let sHighscoreTitle = sprites.create(assets.image`txt_hiscore`)

sScoreTitle.setPosition(18, 18)
sLevelTitle.setPosition(18, 43)
sLinesTitle.setPosition(18, 68)
sHighscoreTitle.setPosition(23, 93)

let sScore = textsprite.create("0", 0, 8)
let sLevel = textsprite.create("0", 0, 8)
let sLines = textsprite.create("0", 0, 8)
let sHighscore = textsprite.create("0", 0, 8)

updateStats()

// ---- AUTO DROP / GRAVITY ----

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