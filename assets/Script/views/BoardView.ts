import {Tile} from "../model/Tile";
import TileControllerComponent from "../model/components/TileControllerComponent";
import {Events} from "../enums/Events";


export class BoardView {
    private gridContainer: cc.Node | null = null;
    private backgroundFrame: cc.Node | null = null;

    constructor(
        private tileSize: number,
        private spacing: number,
        private backgroundPadding: number,
        private backgroundInset: number
    ) {
    }

    public setup(backgroundFrame: cc.Node, gridWidth: number, gridHeight: number): cc.Vec2 {
        this.backgroundFrame = backgroundFrame;

        const bgSprite = this.backgroundFrame.getComponent(cc.Sprite);
        if (bgSprite && bgSprite.spriteFrame) {
            bgSprite.spriteFrame.insetTop = this.backgroundInset;
            bgSprite.spriteFrame.insetBottom = this.backgroundInset;
            bgSprite.spriteFrame.insetLeft = this.backgroundInset;
            bgSprite.spriteFrame.insetRight = this.backgroundInset;
            bgSprite.type = cc.Sprite.Type.SLICED;
        }

        const gridTotalWidth = gridWidth * this.tileSize + (gridWidth - 1) * this.spacing;
        const gridTotalHeight = gridHeight * this.tileSize + (gridHeight - 1) * this.spacing;

        this.backgroundFrame.width = gridTotalWidth + this.backgroundPadding * 2;
        this.backgroundFrame.height = gridTotalHeight + this.backgroundPadding * 2;

        this.gridContainer = new cc.Node('GridContainer');
        this.backgroundFrame.addChild(this.gridContainer);
        this.gridContainer.setPosition(0, 0);
        this.gridContainer.width = gridTotalWidth;
        this.gridContainer.height = gridTotalHeight;

        const mask = this.gridContainer.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        mask.inverted = false;

        return cc.v2(
            -this.backgroundFrame.width / 2 + this.backgroundPadding + this.tileSize / 2,
            this.backgroundFrame.height / 2 - this.backgroundPadding - this.tileSize / 2
        );
    }

    public createTileNode(tile: Tile, startPosition: cc.Vec2, onClickCallback: (tile: Tile) => void) {
        const now = Date.now();
        const tileNode = new cc.Node(`Tile_${now}`);
        this.gridContainer!.addChild(tileNode);

        const x = startPosition.x + tile.col * (this.tileSize + this.spacing);
        const y = startPosition.y - tile.row * (this.tileSize + this.spacing);
        tileNode.setPosition(x, y);

        const sprite = tileNode.addComponent(cc.Sprite);
        sprite.spriteFrame = tile.blueprint.spriteFrame;
        if (sprite.spriteFrame) {
            const originalSize = sprite.spriteFrame.getOriginalSize();
            tileNode.scale = this.tileSize / Math.max(originalSize.width, originalSize.height);
        }

        tile.node = tileNode;

        const controller = tileNode.addComponent(TileControllerComponent);
        controller.tileModel = tile;
        tileNode.on(Events.TILE_CLICKED, onClickCallback, this);

        return tileNode;
    }

    public animateBlast(tiles: Tile[], onComplete: () => void) {
        let destroyedCount = 0;
        const total = tiles.length;

        if (total == 0) {
            onComplete();
            return;
        }

        for (const tile of tiles) {
            if (tile.node) {
                const node = tile.node;
                cc.tween(node)
                    .to(0.15, {scale: 0})
                    .call(() => {
                        node.destroy();
                        tile.node = null;
                        destroyedCount++;
                        if (destroyedCount === total) {
                            onComplete();
                        }
                    })
                    .start();
            } else {
                destroyedCount++;
                if (destroyedCount === total) {
                    onComplete();
                }
            }
        }
    }

    public animateGravity(movedTiles: Tile[], startPosition: cc.Vec2) {
        for (const tile of movedTiles) {
            if (tile.node) {
                const targetY = startPosition.y - tile.row * (this.tileSize + this.spacing);

                cc.tween(tile.node)
                    .to(0.4, {y: targetY}, {easing: 'bounceOut'})
                    .start();
            }
        }
    }

    public animateRefill(newTiles: Tile[], startPosition: cc.Vec2, containerHeight: number,
                         onClickCallback: (tile: Tile) => void, onComplete: () => void) {
        let completedCount = 0;
        const total = newTiles.length;

        if (total === 0) {
            onComplete();
            return;
        }

        const spawnY = containerHeight / 2 + this.tileSize;

        for (const tile of newTiles) {
            const tileNode = this.createTileNode(tile, startPosition, onClickCallback);

            const targetX = startPosition.x + tile.col * (this.tileSize + this.spacing);
            const targetY = startPosition.y - tile.row * (this.tileSize + this.spacing);

            tileNode.setPosition(targetX, spawnY);
            cc.tween(tileNode)
                .to(0.5, {y: targetY}, {easing: 'bounceOut'})
                .call(() => {
                    completedCount++;
                    if (completedCount === total) {
                        onComplete();
                    }
                })
                .start();
        }
    }

    public shakeTile(tile: Tile) {
        if (!tile.node) return;
        const originalX = tile.node.x;
        cc.tween(tile.node)
            .to(0.05, {x: originalX - 5})
            .to(0.1, {x: originalX + 5})
            .to(0.05, {x: originalX})
            .start();
    }

    public getContainerHeight(): number {
        return this.gridContainer ? this.gridContainer.height : 0;
    }

}