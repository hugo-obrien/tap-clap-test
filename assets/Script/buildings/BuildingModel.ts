export class BuildingModel {
    public readonly configId: string;
    private _level: number;

    constructor(configId: string, level: number = 0) {
        if (level < 0) {
            throw new Error('BuildingModel(): Level cannot be negative');
        }
        this.configId = configId;
        this._level = level;
    }

    public get level(): number {
        return this._level;
    }

    public get isPurchased(): boolean {
        return this._level > 0;
    }

    public upgrade(): void {
        this._level++;
    }

    public toSaveData(): {level: number} {
        return {level: this._level};
    }
}