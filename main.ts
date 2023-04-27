class tetrisGrid {
    grid: number[][]
    nextQueue: number[]
    level: number
    score: number
    gridSprites: Sprite[][]
    gravity: number

    private nextSprites: Sprite[][]
    private levelSprite: TextSprite
    private scoreSprite: TextSprite

    constructor () {
        this.grid = []
        this.gridSprites = []
        this.nextQueue = []
        
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
            this.gridSprites.push(s_row)
        }

        this.nextQueue.push(Math.randomRange(1, 7))

        this.nextSprites = []
        for (let i = 0; i < 4; i++) {
            let s_row: Sprite[] = []
            for (let j = 0; j < 4; j++) {
                let cell = sprites.create(assets.image`color7`, SpriteKind.Player)
                cell.setPosition(j * 6 + 127, i * 6 + 25)
                s_row.push(cell)
            }
            this.nextSprites.push(s_row)
        }

        this.level = 1
        this.score = 0
        this.gravity = 1

        this.levelSprite = textsprite.create(this.level.toString())
        this.levelSprite.setMaxFontHeight(8)
        this.levelSprite.setPosition(136, 72)

        this.scoreSprite = textsprite.create(this.score.toString())
        this.scoreSprite.setMaxFontHeight(8)
        this.scoreSprite.setPosition(136, 105)
    }

    updateGrid () {

        for (let i = 0; i < 20; i++) {
            let row: Sprite[] = []
            for (let j = 0; j < 10; j++) {
                let index = this.grid[i][j]
                this.gridSprites[i][j].setImage(typeImages[index])
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let s of this.nextSprites[i]) {
                s.setImage(assets.image`color7`)
            }
        }

        for (let i = 0; i < 4; i++) {
            let x = shapes[this.nextQueue[0]][0][i] % 4
            let y = Math.floor(shapes[this.nextQueue[0]][0][i] / 4)
            this.nextSprites[y][x].setImage(typeImages[this.nextQueue[0]])
        }

        this.levelSprite.setText(this.level.toString())
        this.levelSprite.setPosition(136, 72)

        this.scoreSprite.setText(this.score.toString())
        this.scoreSprite.setPosition(136, 105)
    }

    scanRows () {
        let lines = 0
        for (let i = 0; i < 20; i++) {
            let row: number[] = []
            for (let j = 0; j < 10; j++) {
                row.push(0)
            }
            if (this.grid[i].indexOf(0) == -1) {
                this.grid.removeAt(i)
                this.grid.unshift(row)
                lines++
            }
        }
        switch(lines) {
            case 1:
                this.score += 1
                break
            case 2:
                this.score += 3
                break
            case 3:
                this.score += 5
                break
            case 4:
                this.score += 8
                break
        }

        while (this.score > this.level * 5) {
            this.level ++
        }

        this.gravity = Math.pow((0.8 - ((this.level - 1)*0.007)), this.level - 1) 
        this.updateGrid()
    }

    drawPiece (p: tetrisPiece) {
        this.updateGrid()
        for (let i = 0; i < 4; i++) {
            this.gridSprites[p.relY(i)][p.relX(i)].setImage(typeImages[p.shape])
        }
    }

    nextShape () : number {
        let rndFound = false
        while (!rndFound) {
            let rnd = Math.randomRange(1, 7)
            if (rnd != this.nextQueue[this.nextQueue.length - 1]) {
                this.nextQueue.push(rnd)
                rndFound = true
            }
        }
        return this.nextQueue.shift()
    }
}

class tetrisPiece {

    shape: number
    rotation: number
    posX: number
    posY: number
    frozen: boolean
    velocity: number

    constructor (s: number) {
        this.frozen = false
        this.shape = s
        this.rotation = 0
        this.posX = 3
        this.posY = 0
    }

    numRotations(): number {
        return shapes[this.shape].length
    }

    shapeMatrix (id?:number) : number[] {
        return (id ? shapes[id][0] : shapes[this.shape][this.rotation])
    }

    shapeMatrixAt (i: number) : number { 
        return shapes[this.shape][this.rotation][i]
    }

    relX (i: number) : number {
        return this.posX + this.shapeMatrixAt(i) % 4
    }

    relY (i: number) : number {
        return this.posY + Math.floor(this.shapeMatrixAt(i) / 4)
    }

    rotate (cw: boolean) {
        let r = this.rotation
        // circulate rotation
        let s = ""
        r = ( cw ? r + 1 : r - 1)
        s += r + " > "
        r = ( r > this.numRotations() - 1 ? 0 : (r < 0 ? this.numRotations() - 1 : r ))
        s += r + " max " + (this.numRotations() - 1)
        console.log(s)
        this.rotation = r
        for (let i = 0; i < 4; i++) {
            if ( this.relX(i) > 9) {
                this.posX = 9 - this.shapeMatrixAt(i) % 4
            } else if (this.relX(i) < 0) {
                this.posX = - this.shapeMatrixAt(i) % 4
            }
        }
    }

    moveRight () {
        let f = true
        for (let i = 0; i < 4; i++) {
            let x = this.relX(i)
            let y = this.relY(i)
            if ((x < 9 && tetris.grid[y][x + 1] != 0) || x == 9 ) {
                f = false
            }
        }
        if (f) {
            this.posX++
        }
    }

    moveLeft () {
        let f = true
        for (let i = 0; i < 4; i++) {
            let x = this.relX(i)
            let y = this.relY(i)
            if ((x > 0 && tetris.grid[y][x - 1] != 0) || x == 0) {
                f = false
            }
        }
        if (f) {
            this.posX--
        }
    }

    moveDown () {
        // check if there's room below
        for (let i = 0; i < 4; i++) {
            let x = this.relX(i)
            let y = this.relY(i)
            if ((y < 19 && tetris.grid[y + 1][x] != 0) || y == 19 ) {
                this.freeze()
            }
        }
        if (!this.frozen) {
            this.posY++
        }
    }

    drop () {
        while (!this.frozen) {
            this.moveDown()
        }
    }

    freeze() {
        this.frozen = true
        for (let i = 0; i < 4; i++) {
            let x = this.relX(i)
            let y = this.relY(i)
            tetris.grid[y][x] = this.shape
        }
        this.reset(tetris.nextShape())
        tetris.scanRows()
    }

    reset (s: number) {
        this.posX = 4
        this.posY = 0
        this.rotation = 0
        this.shape = s
        this.frozen = false
    }

    hold () {

    }
}

const shapes: number[][][] = [
        [[]],
        [[1, 5, 9, 13], [0, 1, 2, 3]],
        [[1, 5, 6, 10], [1, 2, 4, 5]],
        [[2, 5, 6, 9], [1, 2, 6, 7]],
        [[1, 4, 5, 6], [1, 5, 6, 9], [0, 1, 2, 5], [1, 4, 5, 9]],
        [[1, 2, 5, 6]],
        [[1, 5, 9, 10], [1, 2, 3, 5], [1, 2, 6, 10], [3, 5, 6, 7]],
        [[1, 5, 8, 9], [0, 4, 5, 6], [1, 2, 5, 9], [0, 1, 2, 6]]
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

let tetris = new tetrisGrid()

let piece = new tetrisPiece(tetris.nextShape())
tetris.drawPiece(piece)
piece.moveDown()

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    piece.rotate(false)
    tetris.drawPiece(piece)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function() {
    piece.rotate(true)
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

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    piece.drop()
    tetris.drawPiece(piece)
})
