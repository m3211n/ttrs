class tetrisGrid {
    
    grid: number[][]

    private spritesGrid: Sprite[][]

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
    }
}

scene.setBackgroundImage(assets.image`game`)

const tetris = new tetrisGrid()