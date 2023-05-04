class Bag {
    preview_1: Sprite[][]
    preview_2: Sprite[][]
    preview_3: Sprite[][]

    contents: number[]

    constructor() {
        this.preview_1 = []
        this.preview_2 = []
        this.preview_3 = []
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
        for (let r = 0; r < 4; r++) {
            let row_1: Sprite[] = []
            let row_2: Sprite[] = []
            let row_3: Sprite[] = []
            for (let c = 0; c < 4; c++) {
                let tmp_sprite = sprites.create(image.create(3, 3))
                tmp_sprite.setPosition(c * 4 + 119, r * 4 + 17)
                row_1.push(tmp_sprite)

                let tmp_sprite_2 = sprites.create(image.create(3, 3))
                tmp_sprite_2.setPosition(c * 4 + 119, r * 4 + 35)
                row_2.push(tmp_sprite_2)

                let tmp_sprite_3 = sprites.create(image.create(3, 3))
                tmp_sprite_3.setPosition(c * 4 + 119, r * 4 + 51)
                row_3.push(tmp_sprite_3)
            }
            this.preview_1.push(row_1)
            this.preview_2.push(row_2)
            this.preview_3.push(row_3)
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
        let tPreview_1 = new Tetrimino(this.contents[0])
        let tPreview_2 = new Tetrimino(this.contents[1])
        let tPreview_3 = new Tetrimino(this.contents[2])
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (c < tPreview_1.cells.length && r < tPreview_1.cells.length && tPreview_1.cells[r][c] != null) {
                    let img = image.create(4, 4)
                    img.fill(tPreview_1.shapeID + 1)
                    this.preview_1[r][c].setImage(img)
                } else {
                    this.preview_1[r][c].setImage(image.create(4, 4))
                }

                if (c < tPreview_2.cells.length && r < tPreview_2.cells.length && tPreview_2.cells[r][c] != null) {
                    let img = image.create(4, 4)
                    img.fill(tPreview_2.shapeID + 1)
                    this.preview_2[r][c].setImage(img)
                } else {
                    this.preview_2[r][c].setImage(image.create(4, 4))
                }

                if (c < tPreview_3.cells.length && r < tPreview_3.cells.length && tPreview_3.cells[r][c] != null) {
                    let img = image.create(4, 4)
                    img.fill(tPreview_3.shapeID + 1)
                    this.preview_3[r][c].setImage(img)
                } else {
                    this.preview_3[r][c].setImage(image.create(4, 4))
                }
            }
        }
        return next
    }
}