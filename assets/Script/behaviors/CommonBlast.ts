import {Tile} from "../model/Tile";
import {TileType} from "../model/enums/TileType";
import {IBehaviorContext, IBehaviorResult, ITileBehavior, RegisterBehavior} from "./IBehavior";

@RegisterBehavior(TileType.COMMON)
export class CommonBlast implements ITileBehavior {

    execute(tile: Tile, context: IBehaviorContext): IBehaviorResult {
        const group = context.getGroup(tile);

        return {
            affectedTiles: group,
            isSuccessful: group.length >= context.getMinBlastGroupSize()
        }
    }
}