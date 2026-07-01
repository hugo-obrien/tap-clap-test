import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameEvent, GlobalEvent} from "../../core/GlobalEvent";
import {GameManager} from "../../core/managers/GameManager";

export enum StatType {
    GOLD = 0,
}

@ccclass
export class StatLabel extends cc.Component {
    @property({type: cc.Enum(StatType)})
    private statType: StatType = StatType.GOLD;

    @property(cc.Label)
    private label: cc.Label = null;

    protected onLoad() {
        if (!this.label) {
            cc.error('StatLabel.onLoad(): Label component not assigned');
            return;
        }

        const eventName = this.getEventForStat(this.statType);
        if (eventName) {
            GlobalEvent.on(eventName, this.updateText, this);
        }

        //this.updateText(this.getValueForStat(this.statType));
        this.refreshValue();
    }

    protected onDestroy() {
        const eventName = this.getEventForStat(this.statType);
        if (eventName) {
            GlobalEvent.off(eventName, this.updateText, this);
        }
    }

    public refreshValue() {
        if (!GameManager.instance.isInitialized) {
            this.scheduleOnce(() => {
                this.refreshValue();
            }, 0.1);
            return;
        }

        const value = this.getValueForStat(this.statType);
        this.updateText(value);
    }

    private getEventForStat(statType: StatType): string | null {
        switch (statType) {
            case StatType.GOLD:
                return GameEvent.SCORE_CHANGED;
            default: {
                cc.warn(`StatLabel.getEventForStat(): event for ${statType} not found`);
                return null;
            }
        }
    }

    private getValueForStat(statType: StatType) {
        switch (statType) {
            case StatType.GOLD:
                return GameManager.instance.score;
            default: {
                cc.warn(`StatLabel.getValueForStat(): value for ${statType} not found`);
                return -1;
            }
        }
    }

    private updateText(value: number) {
        this.label.string = this.formatValue(value);
    }

    private formatValue(value: number): string {
        return value.toString(); // todo template for formatting
    }
}