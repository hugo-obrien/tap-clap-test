import ccclass = cc._decorator.ccclass;
import {BuildingRepository} from "./BuildingRepository";
import {GameManager} from "../core/managers/GameManager";
import {SaveManager} from "../core/managers/SaveManager";

@ccclass
export class AutoIncomeTimer extends cc.Component {
    private readonly TICK_INTERVAL: number = 1;

    protected onLoad() {
        this.schedule(this.onTick, this.TICK_INTERVAL);
    }

    protected onDestroy() {
        this.unschedule(this.onTick);
    }

    private onTick() {
        const income = BuildingRepository.instance.getTotalIncomePerSecond();
        if (income > 0) {
            GameManager.instance.addScore(income);
            SaveManager.instance.saveLastTick(Date.now());
        }
    }
}