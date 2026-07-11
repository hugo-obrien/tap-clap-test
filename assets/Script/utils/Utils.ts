export class Utils {
    public static buildName(base: string, className: string) {
        return `${base}_${className}_${Date.now()}_${Math.random()}`;
    }
}