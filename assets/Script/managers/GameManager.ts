import {SaveManager} from "./SaveManager";
import {GameEvent, GlobalEvent} from "../GlobalEvent";
import {MineWorker, MineWorkerTypes} from "../model/Worker";
import {Miner} from "../model/Miner";
import {MineWorkerFactory} from "../services/MineWorkerFactory";
import ccclass = cc._decorator.ccclass;

@ccclass
export class GameManager extends cc.Component{

    private static _instance: GameManager;

    private static readonly DEFAULT_PRICE_MULTIPLIER: number = 1.15;
    private static readonly TICK_INTERVAL: number = 1;

    public static get instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    private _gold: number = 0;
    private _isInitialized: boolean = false;
    private _workers: MineWorker[];

    public get gold(): number {
        return this._gold;
    }

    public get workers(): MineWorker[] {
        return this._workers;
    }

    public get goldPerSecond(): number {
        let gps = 0;
        for (const worker of this._workers) {
            gps += worker.goldPerSecond;
        }

        return gps;
    }

    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    public initialize() {
        if (this._isInitialized) {
            cc.log('GameManager.initialize(): Already initialized, skipping');
            return
        }

        this._gold = SaveManager.instance.loadScore();
        this.notifyScoreChanged();

        this._workers = SaveManager.instance.loadWorkers();
        this.notifyWorkersChanged();

        this.schedule(this.onTick, GameManager.TICK_INTERVAL);

        this._isInitialized = true;
    }

    protected onDestroy() {
        this.unschedule(this.onTick);
    }

    public addGold(amount: number) {
        if (amount < 0 && Math.abs(amount) > this._gold) {
            cc.log(`Not enought gold. Exists: ${this._gold}, required: ${amount}`);
            return
        }

        if (!this.isInitialized) {
            this.initialize();
        }

        this._gold += amount;
        this.notifyScoreChanged();

        SaveManager.instance.saveGold(this._gold); // todo do not save on every score changing
    }

    public buyWorker() {
        const finalPrice = this.getNextWorkerPrice();
        if (this._gold >= finalPrice) {
            this.addGold(-finalPrice);
            const worker = MineWorkerFactory.createByType(MineWorkerTypes.MINER);
            this.addWorker(worker);
        } else {
            cc.log(`Not enough gold! ${finalPrice} required`);
        }
    }

    public getNextWorkerPrice(): number {
        const minersCount = this._workers.filter(worker => worker instanceof Miner).length;
        const mockPrice = 10; // rework for configs
        return Math.floor(mockPrice * Math.pow(GameManager.DEFAULT_PRICE_MULTIPLIER, minersCount - 1));
    }

    public addWorker(worker: MineWorker) {
        this._workers.push(worker);
        SaveManager.instance.saveWorkers(this._workers);
        this.notifyWorkersChanged();
    }

    private notifyScoreChanged() {
        GlobalEvent.emit(GameEvent.SCORE_CHANGED, this._gold);
    }

    private notifyWorkersChanged() {
        GlobalEvent.emit(GameEvent.WORKERS_CHANGED, this._workers.length);
    }

    private onTick() {
       const income = this.goldPerSecond;
       if (income > 0) {
           this.addGold(income);
       }
    }
}