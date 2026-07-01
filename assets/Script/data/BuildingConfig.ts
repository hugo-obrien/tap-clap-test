export interface BuildingLevelData {
    level: number;
    cost: number;
    income: number;
}

export interface BuildingConfigData {
    id: string;
    displayName: string;
    canUpgradeInfinitely: boolean;
    upgradeMultiplier: number;
    levels: BuildingLevelData[];
}

export class BuildingConfig {
    public readonly id: string;
    public readonly displayName: string;
    public readonly canUpgradeInfinitely: boolean;
    public readonly upgradeMultiplier: number;

    public readonly _levels: BuildingLevelData[];

    constructor(data: BuildingConfigData) {
        this.id = data.id;
        this.displayName = data.displayName;
        this.canUpgradeInfinitely = data.canUpgradeInfinitely;
        this.upgradeMultiplier = data.upgradeMultiplier;
        this._levels = [...data.levels];
    }

    public get maxDefinedLevel(): number {
        return this._levels.length;
    }

    public isLevelDefined(level: number): boolean {
        return level >= 1 && level <= this._levels.length;
    }

    public getLevelData(level: number): BuildingLevelData | null {
        if (!this.isLevelDefined(level)) {
            return null;
        }
        return this._levels[level - 1];
    }
}