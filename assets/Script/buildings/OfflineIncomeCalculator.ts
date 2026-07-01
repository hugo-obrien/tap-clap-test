import {SaveManager} from "../core/managers/SaveManager";
import {BuildingRepository} from "./BuildingRepository";

export interface OfflineIncomeResult {
    seconds: number;
    gold: number;
}

export class OfflineIncomeCalculator {
    private readonly MAX_OFFLINE_SECONDS: number = 24 * 60 * 60; //todo move to game configs

    public calculate(): OfflineIncomeResult {
        const lastTick = SaveManager.instance.loadLastTick();
        const now = Date.now();
        let secondsOffline = Math.floor((now - lastTick) / 1000);

        if (secondsOffline <= 0) {
            return {seconds: 0, gold: 0};
        }

        secondsOffline = Math.min(secondsOffline, this.MAX_OFFLINE_SECONDS);

        const incomePerSecond = BuildingRepository.instance.getTotalIncomePerSecond();
        const gold = secondsOffline * incomePerSecond;

        return {seconds: secondsOffline, gold: gold};
    }

    public formatTime(seconds: number): string {
        if (seconds < 60) return `${seconds} s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} m`;
        return `${Math.floor(seconds / 3600)} h`;
    }
}