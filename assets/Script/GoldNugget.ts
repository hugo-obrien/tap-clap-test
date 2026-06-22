import ccclass = cc._decorator.ccclass;
import {GameManager} from "./GameManager";

@ccclass
export class GoldNugget extends cc.Component {
    protected onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onNuggetTapped, this);
    }

    protected onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onNuggetTapped, this);
    }

    private onNuggetTapped(event: cc.Event.EventTouch) {
        GameManager.instance.addScore(1);

        this.playTapAnimation();
    }

    private playTapAnimation() {
        cc.tween(this.node)
            .to(0.05, {scale: 0.9})
            .to(0.05, {scale: 1.0})
            .start();
    }
}