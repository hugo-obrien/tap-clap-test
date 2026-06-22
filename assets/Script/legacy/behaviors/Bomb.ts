import {IBehaviorContext, ITileBehavior, RegisterBehavior} from "./IBehavior";
import {TileType} from "../model/enums/TileType";
import {Tile} from "../model/Tile";

@RegisterBehavior(TileType.BOMB)
export class Bomb implements ITileBehavior {
    execute(tile: Tile, context: IBehaviorContext): Tile[] {
        const result: Tile[] = [];
        const range = context.getBombRange();
        for (let r = - range; r <= range; r++) {
            for (let c = - range; c <= range; c++) {
                let absR = Math.abs(r);
                let absC = Math.abs(c);
                if (absC + absR <= range) {
                    const row = tile.row + r;
                    const col = tile.col + c;
                    let checkedTile = context.getTile(row, col);
                    if (checkedTile) {
                        result.push(checkedTile);
                    }
                }
            }
        }
        return result;

        /*return {
            affectedTiles: result,
            isSuccessful: true
        }*/
    }
}