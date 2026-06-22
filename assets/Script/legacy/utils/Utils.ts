import {Tile} from "../model/Tile";

export class Utils {
    static getCoords(node: cc.Node): cc.Vec2 {
        const worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));

        let canvas = cc.find('Canvas');
        return canvas.convertToNodeSpaceAR(worldPos);
    }

    static shuffle(array: Tile[]) {
        let currentIndex = array.length;

        while (currentIndex != 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            const currentTile = array[currentIndex];
            const randomTile = array[randomIndex];

            const tempRow = currentTile.row;
            const tempCol = currentTile.col;

            currentTile.row = randomTile.row;
            currentTile.col = randomTile.col;
            randomTile.row = tempRow;
            randomTile.col = tempCol;
        }
    }
}