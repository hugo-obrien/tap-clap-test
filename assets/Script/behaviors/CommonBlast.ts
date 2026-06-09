import {Tile} from "../model/Tile";
import {TileType} from "../model/enums/TileType";
import {IBehaviorContext, IBehaviorResult, ITileBehavior, RegisterBehavior} from "./IBehavior";

@RegisterBehavior(TileType.COMMON)
export class CommonBlast implements ITileBehavior {

    execute(tile: Tile, context: IBehaviorContext): IBehaviorResult {
        cc.log('GameManager.handleCommonTileBlast()');
        const group: Tile[] = [];
        const visited = new Set<string>();
        const queue: Tile[] = [tile];
        const targetId = tile.blueprint.id;

        while (queue.length > 0) {
            const current = queue.shift()!;
            group.push(current);
            visited.add(current.getKey());

            const neighbors = context.getNeighbors(current);
            for (const neighbor of neighbors) {
                const key = neighbor.getKey();
                if (!visited.has(key) && neighbor.blueprint.id === targetId) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }

        return {
            affectedTiles: group,
            isSuccessful: group.length >= context.getMinBlastGroupSize()
        }
    }
}