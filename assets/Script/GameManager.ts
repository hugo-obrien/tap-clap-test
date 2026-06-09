import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Grid} from "./model/Grid";
import {TileBlueprint} from "./model/TileBlueprint";
import {Tile} from "./model/Tile";
import {BoardView} from "./views/BoardView";
import {Events} from "./model/enums/Events";
import {IBehaviorContext, TileBehaviorRegistry} from "./behaviors/IBehavior";

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

    @property({type: cc.Integer, tooltip: "Max turns"})
    maxTurnsCount = 20;
    @property({type: cc.Integer, tooltip: "Score need"})
    scoreNeedToWin = 500;

    private grid: Grid | null = null;
    private boardView: BoardView | null = null;

    private gridStartPosition: cc.Vec2 = cc.v2(0, 0);

    private isProcessing: boolean = false;
    private turnsCount = 0;
    private scoreCount = 0;

    private gridContext: IBehaviorContext;

    private isGameOver: boolean = false;

    protected start() {
        this.validateBlueprints();
        this.initializeBoard();
        this.startNewGame();
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

    private initializeBoard() {
        this.boardView = new BoardView(this.tileSize, this.spacing, this.backgroundPadding, this.backgroundInset);
        this.gridStartPosition = this.boardView.setup(this.backgroundFrame, this.gridWidth, this.gridHeight);

        this.gridContext = {
            getTile: (r, c) => this.grid!.getTile(r, c),
            getNeighbors: (t) => this.grid!.getNeighbors(t),
            getMinBlastGroupSize: () => this.minBlastGroupSize
        };
    }

    private startNewGame() {
        this.grid = new Grid(this.gridWidth, this.gridHeight, this.tileBlueprints);
        this.renderInitialGrid();
        this.turnsCount = 0;
        this.updateMoves();
    }

    private renderInitialGrid() {
        if (!this.grid || !this.boardView) return;

        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid.getTile(row, col);
                if (tile) {
                    this.boardView.createTileNode(tile, this.gridStartPosition, this.onTileClicked.bind(this));
                }
            }
        }
    }

    private onTileClicked(tile: Tile) {
        if (this.isProcessing) {
            //ignoring
            return;
        } else if (!this.grid || !this.boardView) {
            cc.error(`GameManager.onTileClicked(): Grid or BoardView is null`);
            return;
        }

        const behavior = TileBehaviorRegistry.get(tile.blueprint.type);
        if (!behavior) {
            cc.warn(`GameManager.onTileClicked(): ${tile.blueprint.type} is not supported yet`);
            return;
        }

        const result = behavior.execute(tile, this.gridContext);
        if (result.isSuccessful && result.affectedTiles.length > 0) {
            this.isProcessing = true;
            this.grid.removeTiles(result.affectedTiles);
            this.boardView.animateBlast(result.affectedTiles, () => this.processPostBlastSequence());

            let scoreCount = this.calcScore(result.affectedTiles.length);
            this.scoreCount += scoreCount;

            this.node.emit(Events.FLYING_SCORE, {tile: tile.node, score: scoreCount});
        } else {
            this.boardView.shakeTile(tile);
        }

        if (this.scoreCount >= this.scoreNeedToWin) {
            this.win();
        }
    }

    private processPostBlastSequence() {
        if (!this.grid || !this.boardView) return;

        const movedTiles = this.grid.applyGravity();
        this.boardView.animateGravity(movedTiles, this.gridStartPosition);

        const newTiles = this.grid.refill();
        this.boardView.animateRefill(
            newTiles,
            this.gridStartPosition,
            this.boardView.getContainerHeight(),
            this.onTileClicked.bind(this),
            () => this.isProcessing = false);

        this.turnsCount++;
        this.updateMoves();
        if (this.turnsCount >= this.maxTurnsCount) {
            this.lose();
        }
    }

    private updateMoves() {
        const turnsLeft = this.maxTurnsCount - this.turnsCount;
        this.node.emit(Events.MOVES_UPDATED, {
            currentScore: this.scoreCount,
            scoreNeeded: this.scoreNeedToWin,
            turnsLeft: turnsLeft
        });
    }

    private calcScore(n: number) {
        return n * (n + 1) / 2;
    }

    private win() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isProcessing = true;
        this.node.emit(Events.GAME_OVER, {isWin: true});
    }

    private lose() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isProcessing = true;
        this.node.emit(Events.GAME_OVER, {isWin: false});
    }
}