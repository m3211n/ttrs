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
                let tmp_sprite = sprites.create(assets.image`none`)
                tmp_sprite.setPosition(c * 5 + X0, r * 5 + Y0)
                row.push(tmp_sprite)
                c_row.push(null)
            }
            this.cells.push(row)
            this.colors.push(c_row)
        }
        this.respawn()
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
        let n = this.t.cells.length
        for (let r = 0; r < n; r ++) {
            for (let c = 0; c < n; c ++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.cells[r][c]
                }
            }
        }
        this.redraw()
    }

    redraw() {
        for (let r = 0; r < 22; r ++) {
            for (let c = 0; c < 10; c ++) {
                if (this.colors[r][c] != null) {
                    this.cells[r][c].setImage(colors[this.colors[r][c]])
                } else {
                    this.cells[r][c].setImage(assets.image`none`)
                }
            }
        }
    }

    clearRows() {
        for (let r = 2; r < 22; r++) {
            if (this.colors[r].indexOf(null) == -1) {
                this.colors.removeAt(r)
                let emptyRow: number[] = []
                for (let c = 0; c < 10; c++) {
                    emptyRow.push(null)
                }
                this.colors.unshift(emptyRow)
                this.redraw()
            }
        }
    }

    rotate(cw: boolean) {
        // create the rotated copy of the tetrimino
        let n = this.t.cells.length
        let tm = []
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
                this.t.cells[i].reverse()
            }
            // transpose
            for (let i = 0; i < n; i++) {
                tm.push([])
            }
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    tm[j].push(this.t.cells[i][j])
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
            testID ++
        }
        // if wall kicks not needed
        if (canRotate) {
            this.clear()
            this.t.cells = tm
            this.t.r = this.t.r + y_k
            this.t.c = this.t.c + x_k
            this.respawn()

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
                } else if (this.t.rotation == Rotation.Right) {
                    this.t.rotation = Rotation.Zero
                } else if (this.t.rotation == Rotation.Two) {
                    this.t.rotation = Rotation.Right
                } else {
                    this.t.rotation = Rotation.Two
                }
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
        let result = !(this.checkCollision(this.t.r + y_k, this.t.c + x_k, rotatedCells))
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
        while (r < n && !result) {
            let c = 0
            while (c < n && !result) {
                if (cells[r][c] != null) {
                    if ((r + next_r <= 21 && this.colors[r + next_r][c + next_c] > 6) || (r + next_r > 21) || (typeof this.colors[r + next_r][c + next_c] === "undefined")) {
                        result = true
                    }  
                }
                c++
            }
            r++
        }
        return result
    }

    lock() {
        let n = this.t.cells.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = this.t.cells[r][c] + 7
                }
            }
        }
        this.redraw()
        this.t = new Tetrimino(bag.deal())
        console.log("Locked!")
    }
}

class Tetrimino {
    cells: number[][]
    rotation: number
    shapeID: number 
    r: number
    c: number

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
    preview: Sprite[][]

    contents: number[]

    constructor () {
        this.preview = []
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
        for (let r = 0; r < 4; r ++) {
            let row: Sprite[] = []
            for (let c = 0; c < 4; c ++) {
                let tmp_sprite = sprites.create(assets.image`none`)
                tmp_sprite.setPosition(c * 5 + 100, r * 5 + 8)
                row.push(tmp_sprite)
            }
            this.preview.push(row)
        }
    }
    
    deal (): number {
        let next = this.contents.shift()
        if (this.contents.length < 1) {
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
        let tPreview = new Tetrimino(this.contents[0])
        for (let r = 0; r < 4; r ++) {
            for (let c = 0; c < 4; c ++) {
                if (c < tPreview.cells.length && r < tPreview.cells.length && tPreview.cells[r][c] != null) {
                    this.preview[r][c].setImage(colors[tPreview.cells[r][c]])
                } else {
                    this.preview[r][c].setImage(assets.image`none`)
                }
            }
        }
        return next
    }
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
    assets.image`color6`,
    assets.image`locked_color0`,
    assets.image`locked_color1`,
    assets.image`locked_color2`,
    assets.image`locked_color3`,
    assets.image`locked_color4`,
    assets.image`locked_color5`,
    assets.image`locked_color6`
]

const X0 = 36
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

function autoMove() {
    matrix.move(true, 1)
}

function levelUp() {
    level ++
    gravity = Math.pow(0.8 - ((level - 1) * 0.007), level - 1)
    clearInterval(tickID)
    tickID = setInterval(autoMove, 1000 * gravity)
}

scene.setBackgroundImage(assets.image`game`)

let bag = new Bag()
let tetrimino = new Tetrimino(bag.deal())
let matrix = new Matrix(tetrimino)

let tickID = setInterval(autoMove, 1000)

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