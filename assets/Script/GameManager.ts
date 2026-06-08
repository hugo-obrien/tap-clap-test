import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Grid} from "./model/Grid";
import {TileBlueprint} from "./model/TileBlueprint";
import TileControllerComponent from "./model/components/TileControllerComponent";
import {Events} from "./enums/Events";
import {Tile} from "./model/Tile";
import {TileType} from "./enums/TileType";

@ccclass
export default class GameManager extends cc.Component {
    @property({type: cc.Integer, tooltip: "Grid width"})
    gridWidth: number = 10;
    @property({type: cc.Integer, tooltip: "Grid height"})
    gridHeight: number = 10;

    @property({type: cc.Integer, tooltip: "Tile size"})
    tileSize: number = 50;
    @property({type: cc.Integer, tooltip: "Spacing"})
    spacing: number = 5;

    @property({type: cc.Integer, tooltip: "Min blast group size"})
    minBlastGroupSize: number = 3;

    @property({type: [TileBlueprint], tooltip: "Available tiles"})
    tileBlueprints: TileBlueprint[] = [];

    private grid: Grid | null = null;

    private isProcessing: boolean = false;

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

        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid.getTile(row, col);
                if (!tile) {
                    cc.warn(`GameManager.createGridVisuals(): tile ${row}:${col} not found`);
                    continue;
                }

                const tileNode = this.buildTileNode(tile);
                tileNode.setPosition(this.getTilePosition(row, col));
            }
        }
    }

    private onTileClicked(tile: Tile) {
        if (!this.grid) {
            cc.error(`GameManager.onTileClicked(): Grid is null`);
            return;
        } else if (this.isProcessing) {
            //ignoring
            return;
        }

        switch (tile.blueprint.type) {
            case TileType.COMMON: {
                this.blast(tile);
                return;
            }
            default: cc.warn(`GameManager.onTileClicked(): ${tile.blueprint.type} is not supported yet`);
        }
    }

    private blast(tile: Tile) {
        const groupToBlast = this.grid.findConnectedGroup(tile);

        if (groupToBlast.length >= this.minBlastGroupSize) {
            this.isProcessing = true;

            this.grid!.removeTiles(groupToBlast);
            let destroyedCount = 0;
            const totalToDestroy = groupToBlast.length;

            for (const blastedTile of groupToBlast) {
                if (blastedTile.node) {
                    const node = blastedTile.node;
                    cc.tween(node)
                        .to(0.15, {scale: 0})
                        .call(() => {
                            node.destroy();
                            destroyedCount++;
                            if (destroyedCount === totalToDestroy) {
                                this.applyGravityAndRefillVisuals();
                            }
                        })
                        .start();
                    blastedTile.node = null;
                }
            }

        } else {
            this.shakeTile(tile);
        }
    }

    private applyGravityAndRefillVisuals() {
        if (!this.grid) {
            cc.error(`GameManager.applyGravityAndRefillVisuals(): Grid is null`);
            return;
        }

        const movedTiles = this.grid.applyGravity();
        for (const tile of movedTiles) {
            if (tile.node) {
                const targetPos = this.getTilePosition(tile.row, tile.col);
                cc.tween(tile.node)
                    .to(0.3, {y: targetPos.y}, {easing: 'quadOut'})
                    .start();
            }
        }

        const newTiles = this.grid.refill();
        for (const tile of newTiles) {
            const tileNode = this.buildTileNode(tile);

            const targetPos = this.getTilePosition(tile.row, tile.col);
            const startY = targetPos.y + (this.gridHeight * (this.tileSize + this.spacing));
            tileNode.setPosition(targetPos.x, startY);

            cc.tween(tileNode)
                .to(0.4, {y: targetPos.y}, {easing: 'bounceOut'})
                .call(() => this.isProcessing = false)
                .start();
        }

        if (newTiles.length === 0) {
            this.isProcessing = false;
        }
    }

    private getTilePosition(row: number, col: number): cc.Vec2 {
        const xOffset = -(this.gridWidth * this.tileSize) / 2 + this.tileSize / 2;
        const yOffset = (this.gridHeight * this.tileSize) / 2 - this.tileSize / 2;
        return cc.v2(xOffset + col * (this.tileSize + this.spacing), yOffset - row * (this.tileSize + this.spacing));
    }

    private buildTileNode(tile: Tile): cc.Node {
        const now = Date.now();
        const tileNode = new cc.Node(`Tile_${now}`);
        this.node.addChild(tileNode);

        const sprite = tileNode.addComponent(cc.Sprite);
        sprite.spriteFrame = tile.blueprint.spriteFrame;
        if (sprite.spriteFrame) {
            const originalSize = sprite.spriteFrame.getOriginalSize();
            tileNode.scale = this.tileSize / Math.max(originalSize.width, originalSize.height);
        }

        tile.node = tileNode;

        const tileController = tileNode.addComponent(TileControllerComponent);
        tileController.tileModel = tile;
        tileNode.on(Events.TILE_CLICKED, this.onTileClicked, this);

        return tileNode;
    }

    private shakeTile(tile: Tile) {
        if (!tile.node) {
            return;
        }

        const originalPos = tile.node.x;
        cc.tween(tile.node)
            .to(0.05, {x: originalPos - 5})
            .to(0.1, {x: originalPos + 5})
            .to(0.05, {x: originalPos})
            .start();
    }
}