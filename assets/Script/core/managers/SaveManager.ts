export interface BuildingSaveData {
    [buildingId: string]: { level: number };
}

export class SaveManager {
    private static _instance: SaveManager;
    public static get instance(): SaveManager {
        if (!this._instance) {
            this._instance = new SaveManager();
        }
        return this._instance;
    }

    private readonly KEY_SCORE = 'player_score';
    private readonly KEY_BUILDINGS = 'player_buildings';
    private readonly KEY_LAST_TICK = 'last_tick_timestamp';

    public saveScore(score: number): void {
        cc.sys.localStorage.setItem(this.KEY_SCORE, score.toString());
    }

    public loadScore(): number {
        const savedScore = cc.sys.localStorage.getItem(this.KEY_SCORE);
        return savedScore ? parseInt(savedScore, 10) : 0;
    }

    public saveBuildings(data: BuildingSaveData) {
        cc.sys.localStorage.setItem(this.KEY_BUILDINGS, JSON.stringify(data));
    }

    public loadBuildings(): BuildingSaveData {
        const saved = cc.sys.localStorage.getItem(this.KEY_BUILDINGS);
        return saved ? JSON.parse(saved): {};
    }

    public saveLastTick(timestamp: number) {
        cc.sys.localStorage.setItem(this.KEY_LAST_TICK, timestamp);
    }

    public loadLastTick(): number {
        const saved = cc.sys.localStorage.getItem(this.KEY_LAST_TICK);
        return saved ? parseInt(saved, 10) : Date.now();
    }
}