import {Tile} from "../model/Tile";
import {TileType} from "../model/enums/TileType";
import {IBehaviorContext, ITileBehavior, RegisterBehavior} from "./IBehavior";

@RegisterBehavior(TileType.COMMON)
export class CommonBlast implements ITileBehavior {

    execute(tile: Tile, context: IBehaviorContext): Tile[] {
        return context.getGroup(tile);
    }
}