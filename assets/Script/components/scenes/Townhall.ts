import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameManager} from "../../managers/GameManager";
import {GameEvent, GlobalEvent} from "../../GlobalEvent";
import {Utils} from "../../utils/Utils";

@ccclass
export default class Townhall extends cc.Component {
    @property(cc.Button)
    buyMinerButton: cc.Button = null;
    @property(cc.Label)
    buyMinerPrice: cc.Label = null;
    @property(cc.Label)
    incomeLabel: cc.Label = null;

    protected onLoad() {
        this.buyMinerButton.node.on('click', () => {
            GameManager.instance.buyWorker();
        }, this);
        GlobalEvent.on(GameEvent.WORKERS_CHANGED, this.onWorkersChanged, this);
        GlobalEvent.on(GameEvent.INCOME_CHANGED, this.onIncomeChanged, this);
        this.updateLabels();
    }

    protected onDestroy() {
        this.buyMinerButton.node.off('click', () => {
            GameManager.instance.buyWorker();
        }, this);
        GlobalEvent.off(GameEvent.WORKERS_CHANGED, this.onWorkersChanged, this);
        GlobalEvent.off(GameEvent.INCOME_CHANGED, this.onIncomeChanged, this);
    }

    private onWorkersChanged() {
        this.updateWorkerPrice();
    }

    private onIncomeChanged() {
        this.updateIncome();
    }

    private updateLabels() {
        this.updateWorkerPrice();
        this.updateIncome();
    }

    private updateWorkerPrice() {
        let price = GameManager.instance.getNextWorkerPrice();
        this.buyMinerPrice.string = Utils.formatValue(price);
    }

    private updateIncome() {
        let income = GameManager.instance.goldPerSecond;
        this.incomeLabel.string = Utils.formatValue(income);
    }
}