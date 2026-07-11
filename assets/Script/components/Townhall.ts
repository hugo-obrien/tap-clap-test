import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameManager} from "../managers/GameManager";
import {GameEvent, GlobalEvent} from "../GlobalEvent";

@ccclass
export default class Townhall extends cc.Component {
    @property(cc.Button)
    buyMinerButton: cc.Button = null;
    @property(cc.Label)
    buyMinerPrice: cc.Label = null;

    protected onLoad() {
        this.buyMinerButton.node.on('click', () => {
            GameManager.instance.buyWorker();
        }, this);
        GlobalEvent.on(GameEvent.WORKERS_CHANGED, this.onWorkersChanged, this);
        this.buyMinerPrice.string = `${GameManager.instance.getNextWorkerPrice()}`;
    }

    protected onDestroy() {
        this.buyMinerButton.node.off('click', () => {
            GameManager.instance.buyWorker();
        }, this);
        GlobalEvent.off(GameEvent.WORKERS_CHANGED, this.onWorkersChanged, this);
    }

    private onWorkersChanged() {
        this.buyMinerPrice.string = `${GameManager.instance.getNextWorkerPrice()}`;
    }
}