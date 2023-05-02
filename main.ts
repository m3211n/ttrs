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
    }

    respawn() {
        let n = this.t.cells.length
        for (let r = 0; r < n; r ++) {
            for (let c = 0; c < n; c ++) {
                if (this.t.cells[r][c] != null) {
                    if (r + this.t.r < 0) { this.t.moveTo(r, this.t.c) } // wall kick top
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
        let n = this.t.cells.length
        for (let r = 0; r < n; r++) {
            for (let c = 0; c <= n; c++) {
                if (this.t.cells[r][c] != null) {
                    this.colors[r + this.t.r][c + this.t.c] = null
                }
            }
        }
        this.t.rotate(cw)
        this.respawn()
    }

}

class Tetrimino {
    cells: number[][]
    rotation: number
    r: number
    c: number

    constructor(shape: number) {
        this.cells = []
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

    move(vert: true, inc: number) {
        this.r = vert ? this.r + inc : this.r
        this.c = vert ? this.c : this.c + inc
    }

    moveTo(r: number, c: number) {
        this.r = r
        this.c = c
    }

    rotate(cw: boolean) {
        let n = this.cells.length
        let tm = []
        if (cw) {
            // transpose
            for (let i = 0; i < n; i ++) {
                tm.push([])
            }

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j ++) {
                    tm[j].push(this.cells[i][j])
                }
            }
            // reverse
            for (let i = 0; i < n; i ++) {
                tm[i].reverse()
            }
        } else {
            // reverse
            for (let i = 0; i < n; i++) {
                this.cells[i].reverse()
            }
            // transpose
            for (let i = 0; i < n; i++) {
                tm.push([])
            }

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    tm[j].push(this.cells[i][j])
                }
            }
        }
        this.cells = tm
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

const shapes = [
    [4, 5, 6, 7], 
    [0, 3, 4, 5], 
    [2, 3, 4, 5], 
    [0, 1, 2, 3], 
    [1, 2, 3, 4], 
    [1, 3, 4, 5], 
    [0, 1, 4, 5]]

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

scene.setBackgroundImage(assets.image`game`)

let bag = new Bag()
let tetrimino = new Tetrimino(bag.deal())
let matrix = new Matrix(tetrimino)

matrix.respawn()

let i = 0

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    matrix.rotate(true)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    matrix.rotate(false)
})