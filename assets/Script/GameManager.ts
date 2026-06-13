import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Grid} from "./model/Grid";
import {TileBlueprint} from "./model/TileBlueprint";
import {Tile} from "./model/Tile";
import {BoardView} from "./views/BoardView";
import {Events} from "./model/enums/Events";
import {IBehaviorContext, TileBehaviorRegistry} from "./behaviors/IBehavior";
import {TileType} from "./model/enums/TileType";

@ccclass('GridSettings')
export class GridSettings {
    @property({type: cc.Integer, tooltip: "Grid width"})
    gridWidth: number = 9;
    @property({type: cc.Integer, tooltip: "Grid height"})
    gridHeight: number = 9;
    @property({type: cc.Integer, tooltip: "Tile size"})
    tileSize: number = 33;
    @property({type: cc.Integer, tooltip: "Spacing"})
    spacing: number = 1;
}

@ccclass('GameSettings')
export class GameSettings {
    @property({type: cc.Integer, tooltip: "Min blast group size"})
    minBlastGroupSize: number = 3;
    @property({type: [TileBlueprint], tooltip: "Available tiles"})
    tileBlueprints: TileBlueprint[] = [];
    @property({type: cc.Integer, tooltip: "Max turns"})
    maxTurnsCount = 20;
    @property({type: cc.Integer, tooltip: "Score need"})
    scoreNeedToWin = 500;
    @property({type: cc.Integer, tooltip: "Max board shuffles"})
    maxBoardShuffles = 3;
    @property({type: cc.Integer, tooltip: "Bomb range"})
    bombRange: number = 2;
}

@ccclass('BackgroundSettings')
export class BackgroundSettings {
    @property({type: cc.Node, tooltip: "Background sprite node"})
    backgroundFrame: cc.Node = null;
    @property({type: cc.Integer, tooltip: "Background Inset"})
    backgroundInset: number = 70;
    @property({type: cc.Integer, tooltip: "Background Padding"})
    backgroundPadding: number = 50;
}

@ccclass
export default class GameManager extends cc.Component {
    @property({type: GridSettings, tooltip: "Grid Settings"})
    gridSettings = new GridSettings();
    @property({type: GameSettings, tooltip: "Game Settings"})
    gameSettings = new GameSettings();
    @property({type: BackgroundSettings, tooltip: "Background Settings"})
    backgroundSettings = new BackgroundSettings();

    private grid: Grid | null = null;
    private boardView: BoardView | null = null;

    private gridStartPosition: cc.Vec2 = cc.v2(0, 0);

    private isProcessing: boolean = false;
    private turnsCount = 0;
    private scoreCount = 0;
    private shufflesUsed = 0;

    private gridContext: IBehaviorContext;

    private isGameOver: boolean = false;

    protected start() {
        this.validateBlueprints();
        this.initializeBoard();
        this.startNewGame();
    }

    private validateBlueprints() {
        if (this.gameSettings.tileBlueprints.length == 0) {
            cc.error('GameManager.validateBlueprints(): tileBlueprints is empty');
            return;
        }

        const checked = new Set<string>;
        this.gameSettings.tileBlueprints.forEach((bp, index) => {
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
        this.boardView = new BoardView(this.gridSettings.tileSize, this.gridSettings.spacing,
            this.backgroundSettings.backgroundPadding, this.backgroundSettings.backgroundInset);
        this.gridStartPosition = this.boardView.setup(this.backgroundSettings.backgroundFrame,
            this.gridSettings.gridWidth, this.gridSettings.gridHeight);

        this.gridContext = {
            getTile: (r, c) => this.grid!.getTile(r, c),
            getNeighbors: (t) => this.grid!.getNeighbors(t),
            getGroup: (t) => this.grid!.getGroup(t),
            getMinBlastGroupSize: () => this.gameSettings.minBlastGroupSize,
            getBombRange: () => this.gameSettings.bombRange
        };
    }

    private startNewGame() {
        this.grid = new Grid(this.gridSettings.gridWidth, this.gridSettings.gridHeight, this.gameSettings.tileBlueprints);
        this.renderInitialGrid();
        this.turnsCount = 0;
        this.updateMoves();
    }

    private renderInitialGrid() {
        if (!this.grid || !this.boardView) return;

        for (let row = 0; row < this.gridSettings.gridHeight; row++) {
            for (let col = 0; col < this.gridSettings.gridWidth; col++) {
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

        const result = this.executeRecursive(tile, new Set<string>);
        if (result.size > 0) {
            this.isProcessing = true;
            this.grid.removeTiles(result);
            this.boardView.animateBlast(result, () => this.processPostBlastSequence());

            let scoreCount = this.calcScore(result.size);
            this.scoreCount += scoreCount;

            this.node.emit(Events.FLYING_SCORE, {tile: tile.node, score: scoreCount});
        } else {
            this.boardView.shakeTile(tile);
        }

        if (this.scoreCount >= this.gameSettings.scoreNeedToWin) {
            this.win();
            return;
        }
    }

    private executeRecursive(tile: Tile, checked: Set<string>): Set<Tile> {
        let result = new Set<Tile>();
        if (checked.has(tile.key)) {
            return result
        }

        const behavior = TileBehaviorRegistry.get(tile.blueprint.type);
        if (!behavior) {
            cc.warn(`GameManager.executeRecursive() behavior for ${tile.blueprint.type} not found`);
            return result;
        }

        checked.add(tile.key);
        let tiles = behavior.execute(tile, this.gridContext);
        tiles.forEach(affectedItem => {
            result.add(affectedItem);
            if (affectedItem.blueprint.type == TileType.COMMON) {
                return;
            }

            let recursiveAffected = this.executeRecursive(affectedItem, checked);
            recursiveAffected.forEach(item => result.add(item));
        });

        return result;
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
            this.onTileClicked.bind(this));

        this.turnsCount++;
        this.updateMoves();
        if (this.turnsCount >= this.gameSettings.maxTurnsCount) {
            this.lose();
        }

        this.scheduleOnce(this.checkExistingTurns, 0.6);
    }

    private updateMoves() {
        const turnsLeft = this.gameSettings.maxTurnsCount - this.turnsCount;
        this.node.emit(Events.MOVES_UPDATED, {
            currentScore: this.scoreCount,
            scoreNeeded: this.gameSettings.scoreNeedToWin,
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

    private checkExistingTurns() {
        cc.log('GameManager.checkExistingTurns()');
        if (this.grid.haveExistingTurns(this.gameSettings.minBlastGroupSize)) {
            this.isProcessing = false;
            return;
        }

        cc.log('GameManager.checkExistingTurns() there is no turns');
        if (this.shufflesUsed >= this.gameSettings.maxBoardShuffles) {
            this.lose();
            return;
        }

        const shuffled = this.grid.shuffle(this.gameSettings.minBlastGroupSize);
        this.node.emit(Events.SHUFFLE);
        this.boardView.animateShuffle(shuffled, this.gridStartPosition, () => {
            this.shufflesUsed++;
            this.isProcessing = false;
        });
    }
}