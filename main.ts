class tetrisGrid {
    grid: number[][]
    next: number[][]
    level: number
    lines: number
    spritesGrid: Sprite[][]

    private nextGrid: Sprite[][]
    private levelSprite: TextSprite
    private linesSprite: TextSprite

    constructor () {
        this.grid = []
        this.spritesGrid = []
        for (let i = 0; i < 20; i++) {
            let row: number[] = []
            let s_row: Sprite[] = []
            for (let j = 0; j < 10; j++) {
                row.push(0)
                let cell = sprites.create(assets.image`color7`, SpriteKind.Player)
                cell.setPosition(j * 6 + 54, i * 6 + 3)
                s_row.push(cell)
            }
            this.grid.push(row)
            this.spritesGrid.push(s_row)
        }

        this.next = []
        this.nextGrid = []
        for (let i = 0; i < 4; i++) {
            let row: number[] = []
            let s_row: Sprite[] = []
            for (let j = 0; j < 4; j++) {
                row.push(0)
                let cell = sprites.create(assets.image`color7`, SpriteKind.Player)
                cell.setPosition(j * 6 + 127, i * 6 + 25)
                s_row.push(cell)
            }
            this.next.push(row)
            this.nextGrid.push(s_row)
        }

        this.level = 1
        this.lines = 0

        this.levelSprite = textsprite.create(this.level.toString())
        this.levelSprite.setMaxFontHeight(8)
        this.levelSprite.setPosition(136, 72)

        this.linesSprite = textsprite.create(this.lines.toString())
        this.linesSprite.setMaxFontHeight(8)
        this.linesSprite.setPosition(136, 105)
    }

    updateGrid () {

        for (let i = 0; i < 20; i++) {
            let row: Sprite[] = []
            for (let j = 0; j < 10; j++) {
                let index = this.grid[i][j]
                this.spritesGrid[i][j].setImage(typeImages[index])
            }
        }

        this.levelSprite.setText(this.level.toString())
        this.linesSprite.setText(this.lines.toString())
    }

    scanRows () {

        let result: boolean = false
        for (let i = 0; i < 20; i++) {
            let row: number[] = []
            for (let j = 0; j < 10; j++) {
                row.push(0)
            }
            if (this.grid[i].indexOf(0) == -1) {
                this.grid.removeAt(i)
                this.grid.unshift(row)
                result = true
            }
        }
        return result
    }

    drawPiece (p: tetrisPiece) {
        this.updateGrid()
        for (let i = 0; i < 4; i++) {
            let x = p.posX + shapes[p.shape][p.rotation][i] % 4
            let y = p.posY + Math.floor(shapes[p.shape][p.rotation][i] / 4)
            this.spritesGrid[y][x].setImage(typeImages[p.shape])
        }
    }

}

class tetrisPiece {

    shape: number
    rotation: number
    posX: number
    posY: number
    frozen: boolean
    velocity: number

    constructor (s: number, r: number, v: number) {
        this.frozen = false
        this.shape = s
        this.rotation = r
        this.posX = 3
        this.posY = 0
        this.velocity = v
    }

    rotate (cw: boolean) {
        let r = this.rotation
        if (cw) {
            r++
            if (((this.shape == 0 || this.shape == 1 || this.shape == 2) && r > 1) || ((this.shape == 3 || this.shape == 5 || this.shape == 6) && r > 3) || (this.shape == 4)) {
                r = 0
            }
        } else {
            r--
            if (r < 0) {
                if (this.shape == 0 || this.shape == 1 || this.shape == 2) {
                    r = 1
                } else if (this.shape == 3 || this.shape == 5 || this.shape == 6) {
                    r = 3
                } else {
                    r = 0
                }

            }
        }
        this.rotation = r
        for (let i = 0; i < 4; i++) {
            if (this.posX + shapes[this.shape][this.rotation][i] % 4 > 9) {
                this.posX = 9 - shapes[this.shape][this.rotation][i] % 4
            } else if (this.posX + shapes[this.shape][this.rotation][i] % 4 < 0) {
                this.posX = -shapes[this.shape][this.rotation][i] % 4
            }
        }

    }

    moveRight () {
        this.posX++ 
        for (let i = 0; i < 4; i++) {
            if (this.posX + shapes[this.shape][this.rotation][i] % 4 > 9) {
                this.posX = 9 - shapes[this.shape][this.rotation][i] % 4
            }
        }
    }

    moveLeft () {
        this.posX--
        for (let i = 0; i < 4; i++) {
            if (this.posX + shapes[this.shape][this.rotation][i] % 4 < 0) {
                this.posX = -shapes[this.shape][this.rotation][i] % 4
            }
        }
    }

    moveDown () {
        // check if there's room below
        let fflag: boolean = false
        for (let i = 0; i < 4; i++) {
            let x = this.posX + shapes[this.shape][this.rotation][i] % 4
            let y = this.posY + Math.floor(shapes[this.shape][this.rotation][i] / 4)
            console.log(this.posY + " : " + y)
            if (tetris.grid[y + 1][x] != 0 || y > 18 ) {
                fflag = true
            }
        }
        if (fflag) {
            this.freeze()
        } else this.posY++
    }

    drop () {

    }

    freeze() {
        this.frozen = true
        for (let i = 0; i < 4; i++) {
            let x = this.posX + shapes[this.shape][this.rotation][i] % 4
            let y = this.posY + Math.floor(shapes[this.shape][this.rotation][i] / 4)
            tetris.grid[y][x] = this.shape
        }
        tetris.updateGrid()
        console.log(tetris.grid)
    }

    hold () {

    }
}

let shapes: number [][][] = [
    [[]],
    [[1, 5, 9, 13], [0, 1, 2, 3]],
    [[1, 5, 6, 10], [1, 2, 4, 5]],
    [[2, 5, 6, 9], [1, 2, 6, 7]],
    [[1, 4, 5, 6], [1, 5, 6, 9], [0, 1, 2, 5], [1, 4, 5, 9]],
    [[1, 2, 5, 6 ]],
    [[1, 5, 9, 10], [1, 2, 3, 5], [1, 2, 6, 10], [3, 5, 6, 7]],
    [[1, 5, 6, 7], [1, 5, 8, 9], [1, 2, 5, 9], [1, 2, 3, 7]]
]

let typeImages = [
    assets.image`color7`,
    assets.image`color0`,
    assets.image`color1`,
    assets.image`color2`,
    assets.image`color3`,
    assets.image`color4`,
    assets.image`color5`,
    assets.image`color6`,
]

// game.splash("TETRIS", "Press A when ready")

scene.setBackgroundImage(assets.image`game`)

const tetris = new tetrisGrid()

const piece = new tetrisPiece(4, 0, tetris.level)
tetris.drawPiece(piece)

game.onUpdate(function() { 
    if (piece.frozen) {
        const piece = new tetrisPiece(4, 0, tetris.level)
        tetris.drawPiece(piece)
    } else {
        piece.moveDown()
        pause (1000 / tetris.level)
        tetris.drawPiece(piece)
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    piece.rotate(false)
    piece.frozen = true
    tetris.drawPiece(piece)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function() {
    piece.rotate(true)
    piece.frozen = true
    tetris.drawPiece(piece)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
    piece.moveLeft()
    tetris.drawPiece(piece)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    piece.moveRight()
    tetris.drawPiece(piece)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    piece.moveDown()
    tetris.drawPiece(piece)
})
