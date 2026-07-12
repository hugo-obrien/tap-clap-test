export enum ConfigKey {
    PRICE_MULTIPLIER = "defaultPriceMultiplier",
    MOCK_MINER_PRICE = "mockMinerPrice"
}

export enum ConfigType {
    NUMBER
}

export const ConfigKeyTypes: Record<ConfigKey, ConfigType> = {
    [ConfigKey.PRICE_MULTIPLIER]: ConfigType.NUMBER,
    [ConfigKey.MOCK_MINER_PRICE]: ConfigType.NUMBER
};