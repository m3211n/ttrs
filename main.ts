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

    cells (): number[][] {
        let m: number [][] = []
        for (let i = 0; i < 4; i ++) {
            let r: number[] = []
            for (let j = 0; j < 4; j ++) {
                r.push(0)
            }
            m.push(r)
        }
        for (let i = 0; i < 4; i ++){
            let x = this.pieces[this.shape][this.rotation][i] % 4
            let y = Math.floor(this.pieces[this.shape][this.rotation][i] / 4)
            m[y][y] = this.shape
        }
        return m
    }

}