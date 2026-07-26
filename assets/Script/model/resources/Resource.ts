export enum ResourceType {
    GOLD = 'gold',
    FOOD = 'food'
}

export function getAllBaseResourceTypes(): string[] {
    return [
        ResourceType.GOLD,
        ResourceType.FOOD
    ];
}

export class Resource {
    public readonly typeId: string;
    private _amount: number;

    constructor(typeId: string, initialAmount: number = 0) {
        if (!typeId) {
            throw new Error('Resource: typeId is required');
        }
        if (initialAmount < 0) {
            throw new Error('Resource: Amount cannot be negative');
        }

        this.typeId = typeId;
        this._amount = initialAmount;
    }

    public get amount(): number {
        return this._amount;
    }

    public add(amount: number) {
        if (amount < 0) {
            throw new Error('Resource.add(): amount cannot be negative')
        }
        this._amount += amount;
    }

    public spend(amount: number): boolean {
        if (amount < 0) {
            throw new Error('Resource.spend(): amount cannot be negative')
        }
        if (this.amount < amount) {
            return false;
        }

        this._amount -= amount;
        return true;
    }

    public setAmount(amount: number) {
        if (amount < 0) {
            throw new Error('Resource.setAmount(): amount cannot be negative')
        }
        this._amount = amount;
    }

    public toSaveData(): { typeId: string; amount: number } {
        return {typeId: this.typeId, amount: this._amount};
    }

    /*public add(amount: number): void {
        if (amount < 0) {
            throw new Error('Resource: Cannot add negative amount');
        }
        this._amount += amount;
    }

    public remove(amount: number): boolean {
        if (amount < 0) {
            throw new Error('Resource: Cannot remove negative amount');
        }
        if (this._amount < amount) {
            return false;
        }

        this._amount -= amount;
        return true;
    }

    public hasEnough(amount: number): boolean {
        return this._amount >= amount;
    }

    public toSaveData(): number {
        return this._amount;
    }*/
}
