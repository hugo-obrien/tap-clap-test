import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {TileType} from "./enums/TileType";

@ccclass('TileBlueprint')
export class TileBlueprint {
    @property({tooltip: "Id"})
    id: string = "tile_common_blue";

    @property({type: cc.Enum(TileType), tooltip: "Tile type"})
    type: TileType = TileType.COMMON;

    @property({type: cc.SpriteFrame, tooltip: "Sprite"})
    spriteFrame: cc.SpriteFrame = null;

    public toString(): string {
        return `${this.id} - ${this.type}`;
    }
}