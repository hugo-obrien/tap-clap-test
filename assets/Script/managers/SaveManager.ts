import {MineWorker, MineWorkerSaveData} from "../model/Worker";
import {MineWorkerFactory} from "../services/MineWorkerFactory";

export class SaveManager {
    private static _instance: SaveManager;
    public static get instance(): SaveManager {
        if (!this._instance) {
            this._instance = new SaveManager();
        }
        return this._instance;
    }

    private readonly KEY_SCORE = 'player_score';
    private readonly KEY_WORKERS = 'mine_workers';
    private readonly KEY_LAST_TIMESTAMP = 'last_timestamp';

    public saveGold(score: number): void {
        cc.sys.localStorage.setItem(this.KEY_SCORE, score.toString());
    }

    public loadScore(): number {
        const savedScore = cc.sys.localStorage.getItem(this.KEY_SCORE);
        return savedScore ? parseInt(savedScore, 10) : 0;
    }

    public saveWorkers(workers: MineWorker[]) {
        const saveData = workers.map(worker => worker.serialize());
        cc.sys.localStorage.setItem(this.KEY_WORKERS, JSON.stringify(saveData));
    }

    public loadWorkers(): MineWorker[] {
        const json = cc.sys.localStorage.getItem(this.KEY_WORKERS);
        if (!json) {
            cc.log('SaveManager.loadWorkers(): empty json');
            return [];
        }

        try {
            const dataArray: MineWorkerSaveData[] = JSON.parse(json);
            return dataArray.map(data => MineWorkerFactory.createByData(data)).filter(worker => worker != null);
        } catch (ex) {
            cc.error('Failed to parse mine workers data:', ex);
            return [];
        }
    }

    public saveLastTimestamp() {
        const now = Date.now();
        cc.sys.localStorage.setItem(this.KEY_LAST_TIMESTAMP, now.toString());
    }

    public loadLastTimestamp(): number {
        const lastTimestamp = cc.sys.localStorage.getItem(this.KEY_LAST_TIMESTAMP);
        return lastTimestamp ? parseInt(lastTimestamp, 10) : Date.now();
    }
}