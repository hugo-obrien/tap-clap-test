import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {Events, FlyingScorePayload, TurnFinishedPayload} from "./model/enums/Events";
import {Utils} from "./utils/Utils";

@ccclass
export default class UIManager extends cc.Component {
    @property({type: cc.Label, tooltip: "Turn counter label"})
    turnsLabel: cc.Label = null;
    @property({type: cc.Label, tooltip: "Score label"})
    scoreLabel: cc.Label = null;

    protected onLoad() {
        this.node.on(Events.MOVES_UPDATED, this.onMovesUpdated, this)
        this.node.on(Events.FLYING_SCORE, this.flyingScore, this);
    }

    protected onDestroy() {
        this.node.off(Events.MOVES_UPDATED, this.onMovesUpdated, this)
        this.node.off(Events.FLYING_SCORE, this.flyingScore, this);
    }

    private onMovesUpdated(payload: TurnFinishedPayload) {
        if (this.turnsLabel) {
            this.turnsLabel.string = payload.turnsLeft.toString();
        }
        if (this.scoreLabel) {
            this.scoreLabel.string = `${payload.currentScore}/${payload.scoreNeeded}`;
        }
    }

    private flyingScore(payload: FlyingScorePayload) {
        let canvas = cc.find('Canvas')

        const flyingNode = new cc.Node('FlyingScore');
        canvas.addChild(flyingNode);

        const label = flyingNode.addComponent(cc.Label);
        label.string = `+${payload.score}`;
        label.fontSize = 48;
        label.lineHeight = 48;
        label.enableWrapText = false;
        label.node.color = cc.Color.WHITE;

        const startPosition = Utils.getCoords(payload.tile);
        const destination = Utils.getCoords(this.scoreLabel.node);

        flyingNode.setPosition(startPosition);
        flyingNode.zIndex = 1000;
        cc.tween(flyingNode)
            .to(0.1, {scale: 1.3}, {easing: 'cubicOut'})
            .to(0.45, {
                x: cc.lerp(startPosition.x, destination.x, 0.83),
                y: cc.lerp(startPosition.y, destination.y, 0.83)
            }, {easing: 'quadIn'})
            .to(0.4,
                {scale: 0, x: destination.x, y: destination.y},
                {easing: 'backIn'})
            .call(() => flyingNode.destroy())
            .start();
    }
}