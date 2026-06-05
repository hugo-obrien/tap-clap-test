import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Grid} from "./model/Grid";
import {TileBlueprint} from "./model/TileBlueprint";

@ccclass
export default class GameManager extends cc.Component {
    @property({type: cc.Integer, tooltip: "Grid width"})
    gridWidth: number = 10;

    @property({type: cc.Integer, tooltip: "Grid height"})
    gridHeight: number = 10;

    @property({type: cc.Integer, tooltip: "Tile size"})
    tileSize: number = 50;

    @property({type: [TileBlueprint], tooltip: "Available tiles"})
    tileBlueprints: TileBlueprint[] = [];

    private grid: Grid | null = null;

    protected start() {
        this.validateBlueprints();
        this.grid = new Grid(this.gridWidth, this.gridHeight, this.tileBlueprints);
        this.createGridVisuals();
    }

    private validateBlueprints() {
        if (this.tileBlueprints.length == 0) {
            cc.error('GameManager.validateBlueprints(): tileBlueprints is empty');
            return;
        }

        const checked = new Set<string>;
        this.tileBlueprints.forEach((bp, index) => {
            if (!bp.id) {
                cc.error(`GameManager.validateBlueprints(): Blueprint element ${index} have no ID`);
            }
            if (!bp.spriteFrame) {
                cc.error(`GameManager.validateBlueprints(): Blueprint element ${bp.id} have no sprite frame`);
            }
            if (checked.has(bp.id)) {
                cc.error(`GameManager.validateBlueprints(): Duplicated id ${bp.id} at ${index}`);
            }

            checked.add(bp.id);
        })
    }

    private createGridVisuals() {
        if (!this.grid) {
            cc.error(`GameManager.createGridVisuals(): Grid is null`);
            return;
        }

        const xOffset = -(this.gridWidth * this.tileSize) / 2 + this.tileSize / 2;
        const yOffset = (this.gridHeight * this.tileSize) / 2 - this.tileSize / 2;

        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                const tile = this.grid.getTile(r, c);
                if (!tile) {
                    console.log('GameManager.createGridVisuals(): tile %d:%d not found', r, c);
                    break;
                }

                const tileNode = new cc.Node(`Tile_${r}_${c}`);
                tileNode.setPosition(xOffset + c * this.tileSize, yOffset - r * this.tileSize);
                this.node.addChild(tileNode);

                const sprite = tileNode.addComponent(cc.Sprite);
                sprite.spriteFrame = tile.blueprint.spriteFrame;

                if (sprite.spriteFrame) {
                    const originalSize = sprite.spriteFrame.getOriginalSize();
                    tileNode.scale = this.tileSize / Math.max(originalSize.width, originalSize.height);
                }

                tile.node = tileNode;
            }
        }
    }
}