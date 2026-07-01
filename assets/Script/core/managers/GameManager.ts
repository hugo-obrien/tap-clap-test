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

    private _score: number = 0;
    private _isInitialized: boolean = false;

    public get score(): number {
        return this._score;
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

        this._score = SaveManager.instance.loadScore();
        this.notifyScoreChanged();
    }

    public addScore(amount: number) {
        if (!this.isInitialized) {
            this.initialize();
        }

        const newScore = this._score + amount;
        if (newScore < 0) {
            throw new Error('GameManager.addScore(): resulting value is below zero');
        }

        this._score = newScore;
        this.notifyScoreChanged();
        SaveManager.instance.saveScore(this._score); // todo do not save on every score changing
    }

    private notifyScoreChanged() {
        GlobalEvent.emit(GameEvent.SCORE_CHANGED, this._score);
    }
}