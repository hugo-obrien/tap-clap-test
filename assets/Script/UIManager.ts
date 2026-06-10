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

        const overlayGraphics = overlay.addComponent(cc.Graphics);
        overlayGraphics.fillColor = new cc.Color(0, 0, 0, 210);

        const canvasSize = canvas.getContentSize();
        overlayGraphics.rect(-canvasSize.width / 2, -canvasSize.height / 2, canvasSize.width, canvasSize.height);
        overlayGraphics.fill();
        canvas.addChild(overlay);

        const widget = overlay.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;

        const messageContainer = new cc.Node('MessageContainer');
        overlay.addChild(messageContainer);

        const bgNode = new cc.Node('Background');
        messageContainer.addChild(bgNode);
        const graphics = bgNode.addComponent(cc.Graphics);

        const bgWidth = 450;
        const bgHeight = 150;
        bgNode.width = bgWidth;
        bgNode.height = bgHeight;

        const isWin = payload.isWin;
        const fillColor = isWin ? new cc.Color(40, 80, 40, 255) : new cc.Color(80, 40, 40, 255);
        const strokeColor = isWin ? new cc.Color(100, 255, 100, 255) : new cc.Color(255, 100, 100, 255);

        graphics.fillColor = fillColor;
        graphics.strokeColor = strokeColor;
        graphics.lineWidth = 6;

        graphics.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 25);
        graphics.fill();
        graphics.stroke();

        const textNode = new cc.Node('Text');
        textNode.y = -10;
        messageContainer.addChild(textNode);

        const gameOverLabel = textNode.addComponent(cc.Label);
        gameOverLabel.string = payload.isWin ? 'WIN' : 'LOOSE';
        gameOverLabel.fontSize = 90;
        gameOverLabel.lineHeight = 90;
        gameOverLabel.node.color = cc.Color.WHITE;

        let labelOutline = gameOverLabel.addComponent(cc.LabelOutline);
        labelOutline.enabled = true;
        labelOutline.color = cc.Color.BLACK;
        labelOutline.width = 6;

        let labelShadow = gameOverLabel.addComponent(cc.LabelShadow);
        labelShadow.enabled = true;
        labelShadow.color = new cc.Color(0, 0, 0, 150);
        labelShadow.offset = new cc.Vec2(0, -5);
        labelShadow.blur = 10;

        const hintNode = new cc.Node('Hint');
        overlay.addChild(hintNode);

        hintNode.y = -140;
        const hintLabel = hintNode.addComponent(cc.Label);
        hintLabel.string = 'Press anywhere to restart';
        hintLabel.fontSize = 24;
        hintLabel.node.color = cc.Color.WHITE;

        messageContainer.scale = 0;
        messageContainer.opacity = 0;

        cc.tween(messageContainer)
            .to(0.1, {opacity: 255})
            .to(0.5, {scale: 1.15}, {easing: 'sineOut'})
            .to(0.25, {scale: 1.0}, {easing: 'sineIn'})
            .start();

        hintNode.opacity = 0;
        cc.tween(hintNode)
            .delay(0.5)
            .to(0.4, {opacity: 255})
            .start();

        overlay.on(cc.Node.EventType.TOUCH_END, () => {
            const currentScene = cc.director.getScene();
            if (currentScene) {
                cc.director.loadScene(currentScene.name);
            }
        });
    }
}