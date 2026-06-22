export class SaveManager {
    private static _instance: SaveManager;
    public static get instance(): SaveManager {
        if (!this._instance) {
            this._instance = new SaveManager();
        }
        return this._instance;
    }

    private readonly KEY_SCORE = 'player_score';

    public saveScore(score: number): void {
        cc.sys.localStorage.setItem(this.KEY_SCORE, score.toString());
    }

    public loadScore(): number {
        const savedScore = cc.sys.localStorage.getItem(this.KEY_SCORE);
        return savedScore ? parseInt(savedScore, 10) : 0;
    }
}