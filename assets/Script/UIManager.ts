import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Events, TurnFinishedPayload} from "./enums/Events";

@ccclass
export default class UIManager extends cc.Component {
    @property({type: cc.Label, tooltip: "Turn counter label"})
    turnsLabel: cc.Label = null;
    @property({type: cc.Label, tooltip: "Score label"})
    scoreLabel: cc.Label = null;

    protected onLoad() {
        this.node.on(Events.MOVES_UPDATED, this.onMovesUpdated, this)
    }

    protected onDestroy() {
        this.node.off(Events.MOVES_UPDATED, this.onMovesUpdated, this)
    }

    public onMovesUpdated(payload: TurnFinishedPayload) {
        if (this.turnsLabel) {
            this.turnsLabel.string = payload.turnsLeft.toString();
        }
        if (this.scoreLabel) {
            this.scoreLabel.string = `${payload.currentScore}/${payload.scoreNeeded}`;
        }
    }
}