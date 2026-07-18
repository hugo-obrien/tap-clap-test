import value = cc.js.value;

export class Utils {
    public static buildName(base: string, className: string) {
        return `${base}_${className}_${Date.now()}_${Math.random()}`;
    }

    public static formatValue(num: number): string {
        if (num < 1000) {
            return num.toString();
        }

        const suffixes = [
            {threshold: 1e3, suffix: 'K'},
            {threshold: 1e6, suffix: 'M'},
            {threshold: 1e9, suffix: 'B'},
            {threshold: 1e12, suffix: 'T'},
            {threshold: 1e15, suffix: 'Qa'},
            {threshold: 1e18, suffix: 'Qi'},
            {threshold: 1e21, suffix: 'Sx'}
        ]

        let selectedSuffix = suffixes[suffixes.length - 1];
        for (let i = suffixes.length -1; i >= 0; i--) {
            if (num >= suffixes[i].threshold) {
                selectedSuffix = suffixes[i]
                break;
            }
        }

        const scaledValue = num / selectedSuffix.threshold;
        let formatted = scaledValue.toPrecision(3);
        formatted = formatted.replace(/\.?0+$/, "");

        return formatted + selectedSuffix.suffix;
    }
}