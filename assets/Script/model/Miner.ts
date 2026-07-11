import {Utils} from "../utils/Utils";
import {MineWorker, MineWorkerSaveData, MineWorkerTypes} from "./Worker";

export class Miner implements MineWorker {
    private _key: string;

    // todo move to configs
    private _goldPerSecond = 1;
    private _defaultPrice = 10;

    constructor(goldPerSecond: number = 1) {
        this._key = Utils.buildName('MineWorker', 'Worker');
        this._goldPerSecond = goldPerSecond;
    }

    serialize(): MineWorkerSaveData {
        return {
            type: MineWorkerTypes.MINER,
            goldPerSecond: this.goldPerSecond
        }
    }

    public get key() {
        return this._key;
    }

    public get goldPerSecond() {
        return this._goldPerSecond;
    }

    public get defaultPrice() {
        return this._defaultPrice;
    }
}