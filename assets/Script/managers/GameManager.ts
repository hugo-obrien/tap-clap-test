import {SaveManager} from "./SaveManager";
import {GameEvent, GlobalEvent} from "../GlobalEvent";
import {MineWorkerFactory} from "../services/MineWorkerFactory";
import {ConfigLoader} from "../configs/ConfigLoader";
import {Inventory} from "../model/Inventory";
import {ResourceType} from "../model/resources/Resource";
import {MineWorker, MineWorkerTypes} from "../model/units/Worker";
import {Miner} from "../model/units/Miner";
import ccclass = cc._decorator.ccclass;

@ccclass
export class GameManager extends cc.Component {

    private static _instance: GameManager;

    public static get instance(): GameManager {
        if (!this._instance) {
            const node = new cc.Node('GameManager');
            this._instance = node.addComponent(GameManager);
            cc.game.addPersistRootNode(node);
        }
        return this._instance;
    }

    private _isInitialized: boolean = false;
    private _workers: MineWorker[] = [];

    public get gold(): number {
        return Inventory.instance.get(ResourceType.GOLD).amount;
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
    }

    protected onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.saveGame, this);
        this.saveGame();
    }

    protected update(dt: number) {
        if (!this._isInitialized) {
            return;
        }

        this.updateGold(dt);
    }

    private updateGold(dt: number) {
        const income = this.goldPerSecond;
        if (income > 0) {
            const goldEarned = income * dt;
            Inventory.instance.add(ResourceType.GOLD, goldEarned);
        }
    }

    public buyWorker() {
        cc.log('Buy worker pressed');
        const finalPrice = this.getNextWorkerPrice();
        cc.log(`Final price ${finalPrice}`);
        if (Inventory.instance.has(ResourceType.GOLD, finalPrice)) {
            Inventory.instance.spend(ResourceType.GOLD, finalPrice);
            const worker = MineWorkerFactory.createByType(MineWorkerTypes.MINER);
            this.addWorker(worker);
        } else {
            cc.log('Not enough gold');
        }
    }

    public getNextWorkerPrice(): number {
        let config = ConfigLoader.instance.globalConfig;

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
        Inventory.instance.save();
        SaveManager.instance.saveWorkers(this._workers);
        SaveManager.instance.saveLastTimestamp();
    }

    private tryLoadGame() {
        cc.log('GameManager.loadGame() called');

        Inventory.instance.initialize();

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
            Inventory.instance.add(ResourceType.GOLD, offlineMined);
            cc.log(`Offline mined: ${offlineMined}`);
        }
    }

    private notifyWorkersChanged() {
        GlobalEvent.emit(GameEvent.WORKERS_CHANGED, this._workers.length);
        GlobalEvent.emit(GameEvent.INCOME_CHANGED, this.goldPerSecond);
    }
}