import {ConfigKey, ConfigKeyTypes} from "./ConfigKeys";
import {ConfigParser} from "./ConfigParser";

export class ConfigData {
    public readonly priceMultiplier: number;
    public readonly mockMinerPrice: number;

    constructor(rawData: any) {
        this.priceMultiplier = this.getValue<number>(rawData, ConfigKey.PRICE_MULTIPLIER);
        this.mockMinerPrice = this.getValue<number>(rawData, ConfigKey.MOCK_MINER_PRICE);
    }

    private getValue<T>(rawData: any, key: ConfigKey): T {
        const rawWalue = rawData[key];
        if (rawWalue === undefined || rawWalue == null) {
            cc.error(`ConfigData: Missing key ${key}`);
            throw new Error("ConfigData: Missing key");
        }

        const expectedType = ConfigKeyTypes[key];
        return ConfigParser.parse(rawWalue, expectedType, key) as T;
    }
}