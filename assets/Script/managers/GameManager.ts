import {SaveManager} from "./SaveManager";
import {GameEvent, GlobalEvent} from "../GlobalEvent";

export class GameManager {

    private static _instance: GameManager;

    public static get instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    private _gold: number = 0;
    private _isInitialized: boolean = false;

    public get gold(): number {
        return this._gold;
    }

    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    public initialize() {
        if (this._isInitialized) {
            cc.log('GameManager.initialize(): Already initialized, skipping');
            return
        }

        this._isInitialized = true;

        this._gold = SaveManager.instance.loadScore();
        this.notifyScoreChanged();
    }

    public addGold(amount: number) {
        if (amount <= 0) return;

        if (!this.isInitialized) {
            this.initialize();
        }

        this._gold += amount;
        this.notifyScoreChanged();

        SaveManager.instance.saveGold(this._gold); // todo do not save on every score changing
    }

    private notifyScoreChanged() {
        GlobalEvent.emit(GameEvent.SCORE_CHANGED, this._gold);
    }
}