import {TileBlueprint} from "./TileBlueprint";

export class Tile {
    public blueprint: TileBlueprint;
    public row: number;
    public col: number;
    public node: cc.Node | null = null;

    constructor(blueprint: TileBlueprint, row:number, col:number) {
        this.blueprint = blueprint;
        this.row = row;
        this.col = col;
    }
}