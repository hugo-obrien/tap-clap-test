import {MineWorker, MineWorkerSaveData, MineWorkerTypes} from "./Worker";
import {Utils} from "../../utils/Utils";

export class Miner implements MineWorker {
    private _key: string;

    // todo move to configs
    private _baseGoldPerSecond = 0.25;
    private _defaultPrice = 10;

    constructor() {
        this._key = Utils.buildName('MineWorker', 'Worker');
    }

    serialize(): MineWorkerSaveData {
        return {
            type: MineWorkerTypes.MINER,
            //goldPerSecond: this.goldPerSecond
        }
    }

    public get key() {
        return this._key;
    }

    public get goldPerSecond() {
        // todo calculate by configs
        return this._baseGoldPerSecond;
    }

    public get defaultPrice() {
        // todo calculate by configs
        return this._defaultPrice;
    }
}