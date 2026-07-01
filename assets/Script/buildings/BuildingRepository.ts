import {BuildingModel} from "./BuildingModel";
import {BuildingSaveData, SaveManager} from "../core/managers/SaveManager";
import {BuildingConfigLoader} from "../data/BuildingConfigLoader";
import {GameEvent, GlobalEvent} from "../core/GlobalEvent";
import {BuildingEconomyService} from "./BuildingEconomyService";

export class BuildingRepository {
    private static _instance: BuildingRepository;
    public static get instance(): BuildingRepository {
        if (!this._instance) {
            this._instance = new BuildingRepository();
        }

        return this._instance;
    }

    private _buildings: Map<string, BuildingModel> = new Map<string, BuildingModel>();
    private _isInitialized: boolean = false;

    public initialize(): void {
        if (this._isInitialized) return;

        const savedData = SaveManager.instance.loadBuildings();
        const configs = BuildingConfigLoader.instance.getAllConfigs();

        for (const config of configs) {
            const savedLevel = savedData[config.id]?.level ?? 0;
            const model = new BuildingModel(config.id, savedLevel);
            this._buildings.set(config.id, model);
        }

        this._isInitialized = true;
        GlobalEvent.emit(GameEvent.BUILDINGS_LOADED);
        cc.log(`BuildingRepository.initialize(): Initialized ${this._buildings.size} buildings`);
    }

    public getBuilding(configId: string): BuildingModel {
        const building = this._buildings.get(configId);
        if (!building) {
            throw new Error(`BuildingRepository.getBuilding(): Building ${configId} not found`);
        }
        return building;
    }

    public getAllBuildings(): BuildingModel[] {
        return Array.from(this._buildings.values());
    }

    public upgradeBuilding(configId: string): void {
        const building = this.getBuilding(configId);
        building.upgrade();
        this.save();
        GlobalEvent.emit(GameEvent.BUILDING_UPGRADED, configId, building.level);
    }

    public getTotalIncomePerSecond(): number {
        const economy = new BuildingEconomyService();
        let total = 0;
        this._buildings.forEach((building) => {
            if (building.level > 0) {
                const config = BuildingConfigLoader.instance.getConfig(building.configId);
                total += economy.getIncomePerSecond(config, building.level);
            }
        });

        return total;
    }

    public save() {
        const saveData: BuildingSaveData = {};
        this._buildings.forEach((building, id) => {
            saveData[id] = building.toSaveData();
        });

        SaveManager.instance.saveBuildings(saveData);
    }
}