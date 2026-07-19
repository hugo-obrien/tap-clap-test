import {SaveManager} from "./SaveManager";
import {GameEvent, GlobalEvent} from "../GlobalEvent";
import {MineWorker, MineWorkerTypes} from "../model/Worker";
import {Miner} from "../model/Miner";
import {MineWorkerFactory} from "../services/MineWorkerFactory";
import ccclass = cc._decorator.ccclass;
import {ConfigLoader} from "../configs/ConfigLoader";

@ccclass
export class GameManager extends cc.Component{

    private static _instance: GameManager;

    //private static readonly TICK_INTERVAL: number = 1;

    public static get instance(): GameManager {
        if (!this._instance) {
            const node = new cc.Node('GameManager');
            this._instance = node.addComponent(GameManager);
            cc.game.addPersistRootNode(node);
        }
        return this._instance;
    }

    private _gold: number = 0;
    private _isInitialized: boolean = false;
    private _workers: MineWorker[] = [];

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

    public async initialize() {
        if (this._isInitialized) {
            cc.log('GameManager.initialize(): Already initialized, skipping');
            return
        }

        this._isInitialized = true;

        if (!ConfigLoader.instance.isLoaded) {
            cc.log(`GameManager.initialize(): Waiting for config load...`);
            await ConfigLoader.instance.loadConfig();
        }

        cc.game.on(cc.game.EVENT_HIDE, this.saveGame, this);

        this.tryLoadGame();

        //this.schedule(this.onTick, GameManager.TICK_INTERVAL);
    }

    protected onDestroy() {
        this.unschedule(this.onTick);
        cc.game.off(cc.game.EVENT_HIDE, this.saveGame, this);
        this.saveGame();
    }

    protected update(dt: number) {
        if (!this._isInitialized) {
            return;
        }

        const income = this.goldPerSecond;
        if (income > 0) {
            const goldEarned = income * dt;
            this._gold += goldEarned;
            this.notifyScoreChanged();
        }
    }

    public addGold(amount: number) {
        if (amount < 0 && Math.abs(amount) > this._gold) {
            cc.log(`Not enough gold. Exists: ${this._gold}, required: ${amount}`);
            return
        }

        if (!this.isInitialized) {
            this.initialize();
        }

        this._gold += amount;
        this.notifyScoreChanged();
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
        let config = ConfigLoader.instance.config;

        const minersCount = this._workers.filter(worker => worker instanceof Miner).length;
        const priceMultiplier = config.priceMultiplier;
        const mockPrice = config.mockMinerPrice;

        return Math.floor(mockPrice * Math.pow(priceMultiplier, minersCount));
    }

    public addWorker(worker: MineWorker) {
        this._workers.push(worker);
        this.notifyWorkersChanged();
    }

    private saveGame() {
        SaveManager.instance.saveGold(this._gold);
        SaveManager.instance.saveWorkers(this._workers);
        SaveManager.instance.saveLastTimestamp();
    }

    private tryLoadGame() {
        cc.log('GameManager.loadGame() called');

        this._gold = SaveManager.instance.loadScore();
        this.notifyScoreChanged();

        this._workers = SaveManager.instance.loadWorkers();
        this.notifyWorkersChanged();

        const lastTimestamp = SaveManager.instance.loadLastTimestamp();
        const diffSeconds = Math.floor((Date.now() - lastTimestamp) / 1000);

        this.processPostLoad(diffSeconds);
    }

    private processPostLoad(diffSeconds: number) {
        const income = this.goldPerSecond;
        if (income > 0 && diffSeconds > 0) {
            const offlineMined = income * diffSeconds;
            this._gold += offlineMined;
            this.notifyScoreChanged();
            cc.log(`Offline mined: ${offlineMined}`);
        }
    }

    private notifyScoreChanged() {
        GlobalEvent.emit(GameEvent.SCORE_CHANGED, this._gold);
    }

    private notifyWorkersChanged() {
        GlobalEvent.emit(GameEvent.WORKERS_CHANGED, this._workers.length);
        GlobalEvent.emit(GameEvent.INCOME_CHANGED, this.goldPerSecond);
    }

    private onTick() {
        const income = this.goldPerSecond;
        if (income > 0) {
            this._gold += income;
            this.notifyScoreChanged();
        }
    }
}