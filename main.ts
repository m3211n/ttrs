class tetrisPiece {
    pieces: number [][][] = [
        [[4, 5, 6, 7], [2, 6, 10, 14], [8, 9, 10, 11], [1, 5, 9, 13]],
        [[0, 4, 5, 6], [1, 2, 5, 9], [4, 5, 6, 10], [1, 5, 8, 9]],
        [[2, 4, 5, 6], [1, 5, 9, 10], [4, 5, 6, 8], [0,1, 5, 9]],
        [[1, 2, 5, 6], [1, 2, 5, 6], [1, 2, 5, 6], [1, 2, 5, 6]],
        [[1, 2, 4, 5], [1, 5, 6, 10], [5, 6, 8, 9], [0, 4, 5, 9]],
        [[1, 4, 5, 6], [1, 5, 6, 9], [4, 5, 6, 9], [1, 4, 5, 9]],
        [[0, 1, 5, 6], [2, 5, 6, 9], [4, 5,9, 10], [1, 4, 5, 8]]
    ]

    shape: number
    rotation: number

    row: number
    col: number

    matrix: Sprite[][]
   
    constructor (s: number) {
        this.shape = s
        this.rotation = 0
        this.matrix = []

        for (let i = 0; i < 4; i++) {
            let r: Sprite[] = []
            for (let j = 0; j < 4; j++) {
                r.push(null)
            }
            this.matrix.push(r)
        }
        for (let i = 0; i < 4; i++) {
            let x = this.pieces[this.shape][this.rotation][i] % 4
            let y = Math.floor(this.pieces[this.shape][this.rotation][i] / 4)
            this.matrix[y][x] = sprites.create(color[this.shape], SpriteKind.Player)
        }
        this.setLocation(0, 3)
    }

    setLocation (r: number, c: number) {
        this.row = r
        this.col = c

        for (let i = 0; i < 4; i++) {
            let x = this.pieces[this.shape][this.rotation][i] % 4
            let y = Math.floor(this.pieces[this.shape][this.rotation][i] / 4)
            this.matrix[y][x].setPosition((x + this.col) * 6 + FIELD_X, (y + this.row) * 6 + FIELD_Y)
        }
    }

    placeNext () {
        for (let i = 0; i < 4; i++) {
            let x = this.pieces[this.shape][this.rotation][i] % 4
            let y = Math.floor(this.pieces[this.shape][this.rotation][i] / 4)
            this.matrix[y][x].setPosition(x * 6 + 129, y * 6 + 21)
        }
    }
}
class tetrisGame {

    piece: tetrisPiece
    field: Sprite[][]
    next: Sprite[][]
    hold: Sprite[][]

    nextQueue: number[]
    holdQueue: number[]

    level: number
    score: number
    gravity: number

    private levelTS: TextSprite
    private scoreTS: TextSprite

    constructor () {
        this.level = 1
        this.score = 0
        this.gravity = Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)

        this.field = []
        this.next = []

        for (let r = 0; r < 20; r++) {
            let row: Sprite[] = []
            for (let c = 0; c < 10; c++) {
                row.push(null)
            }
            this.field.push(row)
        }

        for (let i = 0; i < 2; i++) {
            let row: Sprite[] = []
            for (let j = 0; j < 4; j++) {
                row.push(null)
            }
            this.next.push(row)
        }

        this.levelTS = textsprite.create(this.level.toString())
        this.levelTS.setPosition(138, 77)
        this.levelTS.setMaxFontHeight(8)

        this.scoreTS = textsprite.create(this.score.toString())
        this.scoreTS.setPosition(138, 101)
        this.scoreTS.setMaxFontHeight(8)

        this.nextQueue = []
        this.nextQueue.push(randomizer())
        this.spawn()

    }

    getNextPiece () : number {
        this.nextQueue.push(randomizer())
        let n = this.nextQueue.shift()
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.next[r][c] != null) {
                    this.next[r][c].destroy()
                }
            }
        }
        this.updateNext()
        return n
    }

    spawn() {
        let p = this.getNextPiece()
        let piece = new tetrisPiece(p)
        this.piece = piece
        let locked = false

        // piece movement

        while (!locked) {
            let r = this.piece.row
            let c = this.piece.col
            while (!tick) { r++ }
            this.piece.setLocation(r, c)
            if (r > 15) {
                this.lock()
                locked = true
            }
        }
        this.spawn()
    }

    lock () {
        for (let r = 0; r < 4; r ++) {
            for (let c = 0; c < 4; c ++) {
                let l_row = this.piece.row + r
                let l_col = this.piece.col + c
                this.field[l_row][l_col] = this.piece.matrix[r][c]
            }
        }
    }

    updateNext() {
        let nextPiece = new tetrisPiece(this.nextQueue[0])
        for (let r = 0; r < 2; r ++) {
            for (let c = 0; c < 4; c++) {
                nextPiece.placeNext()
                this.next[r][c] = nextPiece.matrix[r][c]
            }
        }
    }

    softDrop(reverse: boolean) {
        this.gravity = reverse ? Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1) : 0.05
        console.log ("Reverse = " + reverse + ", gravity is" + this.gravity)
    }

}

function randomizer () : number {
    let n = 0
    if (Math.percentChance(10.7)) {
        n = 2
    } else {
        if (Math.percentChance(13.7)) {
            n = 0
        } else {
            if (Math.percentChance(13.7)) {
                n = 6
            } else { 
                if (Math.percentChance(13.7)) {
                    n = 1
                } else {
                    if (Math.percentChance(16.1)) {
                        n = 3
                    } else {
                        if (Math.percentChance(16.1)) {
                            n = 4
                        } else {
                            n = 5
                        }
                    }
                }
            }
        }
    }
    return n
} 

const color: Image[] = [
    assets.image`color0`,
    assets.image`color1`,
    assets.image`color2`,
    assets.image`color3`,
    assets.image`color4`,
    assets.image`color5`,
    assets.image`color6`
]

const FIELD_X = 54
const FIELD_Y = 3

let tick: boolean = false

scene.setBackgroundImage(assets.image`game`)

let tetris = new tetrisGame()


game.onUpdateInterval(tetris.gravity * 1000, function () {
    tick = true
    tick = false
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function() {
    tetris.softDrop(false)
})

controller.down.onEvent(ControllerButtonEvent.Released, function () {
    tetris.softDrop(true)
})


