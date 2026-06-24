import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {SceneManager, SceneName} from "../../SceneManager";

@ccclass
export class SceneButton extends cc.Component {
    @property({type: cc.Enum(SceneName), tooltip: 'Target scene'})
    private targetScene: SceneName = SceneName.TOWN_HALL;

    protected onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }

    protected onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }

    private onClicked(){
        SceneManager.instance.loadScene(this.targetScene);
    }
}