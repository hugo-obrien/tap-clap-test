import {ConfigType} from "./ConfigKeys";

export class ConfigParser {
    public static parse(value: string, expectedType: ConfigType, key: string): any {
        switch (expectedType) {
            case ConfigType.NUMBER: return this.parseNumber(value, key);
            default: {
                cc.warn(`ConfigParser.parse(): Parser for type ${expectedType} for key ${key} not implemented yet`);
                return value;
            }
        }
    };

    private static parseNumber(value: string, key: string): number {
        const num = Number(value);
        if (isNaN(num)) {
            cc.error(`ConfigParser.parseNumber(): Invalid value ${value} for key ${key}`);
            throw new Error("Invalid number value");
        }
        return num;
    }
}