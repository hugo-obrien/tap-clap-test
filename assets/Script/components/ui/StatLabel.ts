import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameManager} from "../../managers/GameManager";
import {GameEvent, GlobalEvent} from "../../GlobalEvent";
import {Utils} from "../../utils/Utils";
import {ResourceType} from "../../model/resources/Resource";

export enum StatType {
    GOLD = 0,
    MINER = 1
}

@ccclass
export class StatLabel extends cc.Component {
    @property({type: cc.Enum(StatType)})
    private statType: StatType = null;

    @property(cc.Label)
    private label: cc.Label = null;

    protected onLoad() {
        if (!this.label) {
            cc.error('StatLabel.onLoad(): Label component not assigned');
            return;
        }

        const eventName = this.getEventForStat(this.statType);
        if (eventName) {
            switch (eventName) {
                case GameEvent.RESOURCE_CHANGED: {
                    GlobalEvent.on(eventName, this.onResourceChanged, this);
                    break;
                }
                default:
                    GlobalEvent.on(eventName, this.updateText, this);
            }

        }

        this.refreshValue();
    }

    protected onDestroy() {
        const eventName = this.getEventForStat(this.statType);
        if (eventName) {
            switch (eventName) {
                case GameEvent.RESOURCE_CHANGED: {
                    GlobalEvent.off(eventName, this.onResourceChanged, this);
                    break;
                }
                default:
                    GlobalEvent.off(eventName, this.updateText, this);
            }
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
                return GameEvent.RESOURCE_CHANGED;
            case StatType.MINER:
                return GameEvent.WORKERS_CHANGED;
            default: {
                cc.warn(`StatLabel.getEventForStat(): event for ${statType} not found`);
                return null;
            }
        }
    }

    private getValueForStat(statType: StatType) {
        switch (statType) {
            case StatType.GOLD:
                return GameManager.instance.gold;
            case StatType.MINER:
                return GameManager.instance.workers.length;
            default: {
                cc.warn(`StatLabel.getValueForStat(): value for ${statType} not found`);
                return -1;
            }
        }
    }

    private onResourceChanged(typeId: string, amount: number) {
        if (this.statType === StatType.GOLD && typeId === ResourceType.GOLD) {
            this.updateText(amount);
        }
    }

    private updateText(value: number) {
        this.label.string = Utils.formatValue(value);
    }
}