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

    @property({type: cc.Node, tooltip: "Background sprite node"})
    backgroundFrame: cc.Node = null;
    @property({type: cc.Integer, tooltip: "Background Inset"})
    backgroundInset: number = 20;
    @property({type: cc.Integer, tooltip: "Background Padding"})
    backgroundPadding: number = 20;

    private grid: Grid | null = null;

    private isProcessing: boolean = false;
    private gridStartPosition: cc.Vec2 = cc.v2(0, 0);
    private gridContainer: cc.Node | null = null;

    protected start() {
        this.validateBlueprints();
        this.setupGridMask();
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

        this.updateBackgroundAndGridPosition();

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
            default:
                cc.warn(`GameManager.onTileClicked(): ${tile.blueprint.type} is not supported yet`);
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
                    .to(0.4, {y: targetPos.y}, {easing: 'bounceOut'})
                    .start();
            }
        }

        const newTiles = this.grid.refill();
        let completedAnimations = 0;

        for (const tile of newTiles) {
            const tileNode = this.buildTileNode(tile);

            const targetPos = this.getTilePosition(tile.row, tile.col);
            const startY = targetPos.y + (this.gridHeight * (this.tileSize + this.spacing));
            tileNode.setPosition(targetPos.x, startY);

            cc.tween(tileNode)
                .to(0.5, {y: targetPos.y}, {easing: 'bounceOut'})
                .call(() => {
                    completedAnimations++;
                    if (completedAnimations === newTiles.length) {
                        this.isProcessing = false;
                    }
                })
                .start();
        }

        if (newTiles.length === 0) {
            this.isProcessing = false;
        }
    }

    private getTilePosition(row: number, col: number): cc.Vec2 {
        const x = this.gridStartPosition.x + col * (this.tileSize + this.spacing);
        const y = this.gridStartPosition.y - row * (this.tileSize + this.spacing);
        return cc.v2(x, y);
    }

    private buildTileNode(tile: Tile): cc.Node {
        const now = Date.now();
        const tileNode = new cc.Node(`Tile_${now}`);
        this.gridContainer.addChild(tileNode);

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

    private updateBackgroundAndGridPosition() {
        if (!this.backgroundFrame) {
            cc.warn('GameManager.updateBackgroundAndGridPosition(): backgroundFrame is null');
            return;
        }

        const gridTotalWidth = this.gridWidth * this.tileSize + (this.gridWidth - 1) * this.spacing;
        const gridTotalHeight = this.gridHeight * this.tileSize + (this.gridHeight - 1) * this.spacing;

        const requiredBgWidth = gridTotalWidth + this.backgroundPadding * 2;
        const requiredBgHeight = gridTotalHeight + this.backgroundPadding * 2;

        const bgSprite = this.backgroundFrame.getComponent(cc.Sprite);
        const bgSpriteFrame = bgSprite.spriteFrame;

        bgSpriteFrame.insetTop = this.backgroundInset;
        bgSpriteFrame.insetBottom = this.backgroundInset;
        bgSpriteFrame.insetLeft = this.backgroundInset;
        bgSpriteFrame.insetRight = this.backgroundInset;
        bgSprite.type = cc.Sprite.Type.SLICED;

        this.backgroundFrame.width = requiredBgWidth;
        this.backgroundFrame.height = requiredBgHeight;
        this.gridStartPosition = cc.v2(
            -(this.backgroundFrame.width / 2) + this.backgroundPadding + (this.tileSize / 2),
            (this.backgroundFrame.height / 2) - this.backgroundPadding - (this.tileSize / 2)
        );
    }

    private setupGridMask() {
        if (!this.backgroundFrame) return;

        this.gridContainer = new cc.Node('GridContainer');
        this.backgroundFrame.addChild(this.gridContainer);

        this.gridContainer.setPosition(0, 0);

        const gridTotalWidth = this.gridWidth * this.tileSize + (this.gridWidth - 1) * this.spacing;
        const gridTotalHeight = this.gridHeight * this.tileSize + (this.gridHeight - 1) * this.spacing;

        this.gridContainer.width = gridTotalWidth;
        this.gridContainer.height = gridTotalHeight;

        const mask = this.gridContainer.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        mask.inverted = false;
    }
}