import {SaveManager} from "./SaveManager";
import {GameEvent, GlobalEvent} from "./GlobalEvent";

export class GameManager {

    private static _instance: GameManager;

    public static get instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    private _score: number = 0;

    public get score(): number {
        return this._score;
    }

    public initialize() {
        this._score = SaveManager.instance.loadScore();
        this.notifyScoreChanged();
    }

    public addScore(amount: number) {
        if (amount <= 0) return;

        this._score += amount;
        this.notifyScoreChanged();

        SaveManager.instance.saveScore(this._score); // todo do not save on every score changing
    }

    private notifyScoreChanged() {
        GlobalEvent.emit(GameEvent.SCORE_CHANGED, this._score);
    }
}