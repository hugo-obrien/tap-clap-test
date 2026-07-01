import {BuildingConfig} from "../data/BuildingConfig";

export class BuildingEconomyService {
    public canUpgrade(config: BuildingConfig, currentLevel: number, currenGold: number): boolean {
        if (!config.canUpgradeInfinitely && currentLevel >= config.maxDefinedLevel) {
            return false;
        }

        const cost = this.getUpgradeCost(config, currentLevel);
        return currenGold >= cost;
    }

    public getUpgradeCost(config: BuildingConfig, currentLevel: number): number {
        const nextLevel = currentLevel + 1;

        const levelData = config.getLevelData(nextLevel);
        if (levelData) {
            return levelData.cost;
        }

        if (config.canUpgradeInfinitely) {
            const lastLevelData = config.getLevelData(config.maxDefinedLevel);
            if (!lastLevelData) return Infinity;

            const lastCost = lastLevelData.cost;
            const infiniteSteps = nextLevel - config.maxDefinedLevel;
            return Math.floor(lastCost * Math.pow(config.upgradeMultiplier, infiniteSteps));
        }

        return Infinity;
    }

    public getIncomePerSecond(config: BuildingConfig, currentLevel: number) {
        if (currentLevel <= 0) return 0;

        const levelData = config.getLevelData(currentLevel);
        if (levelData) {
            return levelData.income;
        }

        if (config.canUpgradeInfinitely) {
            const lastLevelData = config.getLevelData(config.maxDefinedLevel);
            if (!lastLevelData) return 0;

            const lastIncome = lastLevelData.income;
            const infiniteLevelsCount = currentLevel - config.maxDefinedLevel;
            return infiniteLevelsCount * lastIncome;
        }

        cc.warn(`BuildingEconomyService.getIncomePerSecond(): fallback value for ${config.id} at level ${currentLevel}`);
        return 0;
    }
}