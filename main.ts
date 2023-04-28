class tetrisPiece {
    pieces: number [][][] = [
        [[1,2,5,6]],
        [[1,5,6,10], [1,2,4,5]],
        [[2,5,6,9], [1,2,6,7]],
        [[1,5,9,13], [4,5,6,7]],
        [[1,4,5,6], [1,5,6,9], [4,5,6,9], [1,4,5,9]],
        [[1,2,5,9], [4,5,6,10], [1,5,8,9], [0,4,5,6]],
        [[0,1,5,9], [2,4,5,6], [1,5,9,10], [4,5,6,8]]
    ]

    shape: number
    rotation: number

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
    }
}

class tetrisGame {

    piece: tetrisPiece
    field: Sprite[][]

    nextQueue: number[]
    holdQueue: number[]

    lines: number
    level: number
    score: number

    private linesTS: TextSprite
    private levelTS: TextSprite
    private scoreTS: TextSprite

    constructor () {
        this.lines = 0
        this.level = 1
        this.score = 0

        this.field = []
        for (let r = 0; r < 20; r++) {
            let row: Sprite[] = []
            for (let c = 0; c < 10; c++) {
                row.push(null)
            }
            this.field.push(row)
        }

        this.linesTS = textsprite.create(this.lines.toString())
        this.linesTS.setPosition(25, 66)
        this.linesTS.setMaxFontHeight(10)

        this.levelTS = textsprite.create(this.level.toString())
        this.levelTS.setPosition(135, 66)
        this.levelTS.setMaxFontHeight(10)

        this.scoreTS = textsprite.create(this.score.toString())
        this.scoreTS.setPosition(135, 97)
        this.scoreTS.setMaxFontHeight(10)
    }

    start() {

        this.nextQueue.push(Math.randomRange(0, 6))

        this.piece = new tetrisPiece(0)
    }

}

const color: Image[] = [
    assets.image`none`,
    assets.image`color0`,
    assets.image`color1`,
    assets.image`color2`,
    assets.image`color3`,
    assets.image`color4`,
    assets.image`color5`,
    assets.image`color6`
]

scene.setBackgroundImage(assets.image`game`)

let tetris = new tetrisGame()

tetris.start()