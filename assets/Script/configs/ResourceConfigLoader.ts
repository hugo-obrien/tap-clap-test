import {ResourceConfig, ResourceConfigData} from "./ResourceConfig";
import {getAllBaseResourceTypes} from "../model/resources/Resource";

export class ResourceConfigLoader {
    private static _instance: ResourceConfigLoader;
    public static get instance(): ResourceConfigLoader {
        if (!this._instance) {
            this._instance = new ResourceConfigLoader();
        }
        return this._instance;
    }

    private readonly _configs: Map<string, ResourceConfig> = new Map();
    private _isLoaded: boolean = false;

    public get isLoaded(): boolean {
        return this._isLoaded;
    }

    public load(): Promise<void> {
        cc.log('ResourceConfigLoader.load() called');
        return new Promise((resolve, reject) => {
            this.registerBaseDefaults();

            cc.resources.load('configs/resources', cc.JsonAsset, (err, asset) => {
                if (err) {
                    cc.error('ResourceConfigLoader: Failed to load', err);
                    reject(err);
                    return;
                }

                const data = asset.json as { resources: ResourceConfigData[] };
                this.parseConfigs(data.resources);
                this._isLoaded = true;

                cc.log(`ResourceConfigLoader: Loaded ${this._configs.size} resource types`);
                resolve();
            })
        });
    }

    public getConfig(typeId: string): ResourceConfig {
        const config = this._configs.get(typeId);
        if (!config) {
            throw new Error(`ResourceConfigLoader.getConfig(${typeId}): Unknown resource type`);
        }
        return config;
    }

    public isKnownType(typeId: string): boolean {
        return this._configs.has(typeId);
    }

    public getAllConfigs(): ResourceConfig[] {
        const result: ResourceConfig[] = [];
        this._configs.forEach((c) => result.push(c));
        return result;
    }

    private registerBaseDefaults() {
        const baseTypes = getAllBaseResourceTypes();
        for (const id of baseTypes) {
            this._configs.set(id, new ResourceConfig({
                id: id,
            }))
        }
    }

    private parseConfigs(resourceData: ResourceConfigData[]) {
        cc.log('ResourceConfigLoader.parseConfigs() called');
        for (const data of resourceData) {
            if (!data.id) {
                cc.warn('ResourceConfigLoader.parseConfigs(): config entry without id, skipping')
                continue;
            }

            this._configs.set(data.id, new ResourceConfig(data));
            cc.log(`ResourceConfigLoader.parseConfigs(): added ${data.id}`);
        }
    }
}