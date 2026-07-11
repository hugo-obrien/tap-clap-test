export interface MineWorker {
    readonly key: string;
    readonly goldPerSecond: number;
    readonly defaultPrice: number;

    serialize(): MineWorkerSaveData;
}

export interface MineWorkerSaveData {
    type: MineWorkerTypes;
    goldPerSecond: number;
}

export enum MineWorkerTypes {
    MINER
}