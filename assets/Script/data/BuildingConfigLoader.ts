import {BuildingConfig, BuildingConfigData} from "./BuildingConfig";

export class BuildingConfigLoader {
    private static _instance: BuildingConfigLoader;
    public static get instance(): BuildingConfigLoader {
        if (!this._instance) {
            this._instance = new BuildingConfigLoader();
        }

        return this._instance;
    }

    private _configs: Map<string, BuildingConfig> = new Map();
    private _isLoaded: boolean = false;

    public get isLoaded(): boolean {
        return this._isLoaded;
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            cc.resources.load('config/buildings', cc.JsonAsset, (err, asset) => {
                if (err) {
                    cc.error('BuildingConfigLoader.load(): Failed to load', err);
                    reject(err);
                    return;
                }

                const data = asset.json as { buildings: BuildingConfigData[] };
                this.parseConfigs(data.buildings);
                this._isLoaded = true;
                cc.log(`BuildingConfigLoader.load(): Loaded ${this._configs.size} buildings`);
                resolve();
            });
        });
    }

    private parseConfigs(buildingData: BuildingConfigData[]) {
        for (const data of buildingData) {
            const config = new BuildingConfig(data);
            this._configs.set(config.id, config);
        }
    }

    public getConfig(id: string): BuildingConfig {
        const config = this._configs.get(id);
        if (!config) {
            throw new Error(`BuildingConfigLoader.getConfig(): Config ${id} not found`);
        }
        return config;
    }

    public getAllConfigs(): BuildingConfig[] {
        return Array.from(this._configs.values());
    }
}
