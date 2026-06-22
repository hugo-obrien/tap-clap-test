import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameEvent, GlobalEvent} from "./GlobalEvent";
import {GameManager} from "./GameManager";

@ccclass
export class ScoreLabel extends cc.Component {
    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    protected onLoad() {
        if (!this.scoreLabel) {
            cc.error('ScoreLabel.onLoad(): scoreLabel is null');
            return;
        }

        GlobalEvent.on(GameEvent.SCORE_CHANGED, this.updateScoreText, this);
        this.updateScoreText(GameManager.instance.score);
    }

    protected onDestroy() {
        GlobalEvent.off(GameEvent.SCORE_CHANGED, this.updateScoreText, this);
    }

    private updateScoreText(score: number) {
        this.scoreLabel.string = this.formatScore(score);
    }

    private formatScore(score: number) {
        return score.toString();
    }
}