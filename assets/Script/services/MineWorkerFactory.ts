import {MineWorker, MineWorkerSaveData, MineWorkerTypes} from "../model/units/Worker";
import {Miner} from "../model/units/Miner";

export class MineWorkerFactory {
    public static createByData(data: MineWorkerSaveData): MineWorker {
        switch (data.type) {
            case MineWorkerTypes.MINER: return new Miner();
            default:
                cc.warn(`MineWorker for type ${data.type} not defined`);
        }
    }

    public static createByType(type: MineWorkerTypes): MineWorker {
        switch (type) {
            case MineWorkerTypes.MINER: return new Miner();
            default:
                cc.warn(`MineWorker for type ${type} not defined`);
        }
    }
}