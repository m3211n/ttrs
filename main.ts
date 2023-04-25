class tetrisGrid {
    
    grid: number[][]
    next: number[][]

    score: number
    lines: number

    private spritesGrid: Sprite[][]
    private nextGrid: Sprite[][]
    private scoreSprite: TextSprite
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

        this.scoreSprite = textsprite.create("0")
        this.scoreSprite.setMaxFontHeight(10)
        this.scoreSprite.setPosition(137, 72)

        this.linesSprite = textsprite.create("0")
        this.linesSprite.setMaxFontHeight(10)
        this.linesSprite.setPosition(137, 105)
    }

    update () {

        let images = [
            assets.image`color7`,
            assets.image`color0`,
            assets.image`color1`,
            assets.image`color2`,
            assets.image`color3`,
            assets.image`color4`,
            assets.image`color5`,
            assets.image`color6`,
        ]

        for (let i = 0; i < 20; i++) {
            let row: Sprite[] = []
            for (let j = 0; j < 10; j++) {
                let index = this.grid[i][j]
                this.spritesGrid[i][j].setImage(images[index])
            }
            
        }

        this.scoreSprite.setText(this.score.toString())
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

}

class tetrisPiece {

    shape: number
    rotation: number
    posX: number
    posY: number

    constructor (s: number, r: number, speed: number) {
        this.shape = s
        this.rotation = r
        this.posX = 5
        this.posY = 0
    }
    
}

scene.setBackgroundImage(assets.image`game`)

const tetris = new tetrisGrid()