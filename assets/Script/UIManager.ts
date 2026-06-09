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
        this.node.on(Events.FLYING_SCORE, this.onFlyingScore, this);
        this.node.on(Events.GAME_OVER, this.onGameOver, this);
    }

    protected onDestroy() {
        this.node.off(Events.MOVES_UPDATED, this.onMovesUpdated, this)
        this.node.off(Events.FLYING_SCORE, this.onFlyingScore, this);
        this.node.off(Events.GAME_OVER, this.onGameOver, this);
    }

    private onMovesUpdated(payload: TurnFinishedPayload) {
        if (this.turnsLabel) {
            this.turnsLabel.string = payload.turnsLeft.toString();
        }
        if (this.scoreLabel) {
            this.scoreLabel.string = `${payload.currentScore}/${payload.scoreNeeded}`;
        }
    }

    private onFlyingScore(payload: FlyingScorePayload) {
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
                x: cc.misc.lerp(startPosition.x, destination.x, 0.83),
                y: cc.misc.lerp(startPosition.y, destination.y, 0.83)
            }, {easing: 'quadIn'})
            .to(0.4,
                {scale: 0, x: destination.x, y: destination.y},
                {easing: 'backIn'})
            .call(() => flyingNode.destroy())
            .start();
    }

    private onGameOver(payload: { isWin: boolean }) {
        const canvas = cc.find('Canvas');
        if (!canvas) {
            return;
        }

        const overlay = new cc.Node('GameOverOverlay');
        overlay.addComponent(cc.BlockInputEvents);
        overlay.color = new cc.Color(0, 0, 0, 180);

        const widget = overlay.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;

        canvas.addChild(overlay);

        const messageNode = new cc.Node('GameOverMessage');
        overlay.addChild(messageNode);

        const gameOverLabel = messageNode.addComponent(cc.Label);
        gameOverLabel.string = payload.isWin ? 'WIN' : 'LOOSE';
        gameOverLabel.fontSize = 72;
        gameOverLabel.lineHeight = 72;
        gameOverLabel.node.color = payload.isWin ? new cc.Color(100, 255, 100) : new cc.Color(255, 100, 100);

        const hintNode = new cc.Node('Hint');
        overlay.addChild(hintNode);

        hintNode.y = -80;
        const hintLabel = hintNode.addComponent(cc.Label);
        hintLabel.string = 'Press anywhere to restart';
        hintLabel.fontSize = 24;
        hintLabel.node.color = cc.Color.WHITE;

        messageNode.scale = 0;
        messageNode.opacity = 0;

        cc.tween(messageNode)
            .to(0.1, {opacity: 255})
            .to(0.6, {scale: 1.2}, {easing: 'backOut'})
            .to(0.2, {scale: 1.0}, {easing: 'bounceOut'})
            .start();

        hintNode.opacity = 0;
        cc.tween(hintNode)
            .delay(0.5)
            .to(0.4, { opacity: 255 })
            .start();

        overlay.on(cc.Node.EventType.TOUCH_END, () => {
            const currentScene = cc.director.getScene();
            if (currentScene) {
                cc.director.loadScene(currentScene.name);
            }
        });
    }
}