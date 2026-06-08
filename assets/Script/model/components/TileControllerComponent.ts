import ccclass = cc._decorator.ccclass;
import {Tile} from "../Tile";
import {Events} from "../../enums/Events";

@ccclass
export default class TileControllerComponent extends cc.Component {
    public tileModel: Tile | null = null;

    protected onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (this.tileModel) {
            this.node.emit(Events.TILE_CLICKED, this.tileModel);
        }
    }
}