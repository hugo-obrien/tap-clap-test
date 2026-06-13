import {Tile} from "../model/Tile";
import {TileType} from "../model/enums/TileType";

export const TileBehaviorRegistry = new Map<TileType, ITileBehavior>();

export interface ITileBehavior {
    execute(tile: Tile, context: IBehaviorContext): Tile[];
}

export interface IBehaviorContext {
    getTile(row: number, col: number): Tile | null;
    getNeighbors(tile: Tile): Tile[];
    getGroup(tile: Tile): Tile[];
    getMinBlastGroupSize(): number;
    getBombRange(): number;
}

export function RegisterBehavior(type: TileType) {
    return function (constructor: new () => ITileBehavior) {
        TileBehaviorRegistry.set(type, new constructor());
    }
}