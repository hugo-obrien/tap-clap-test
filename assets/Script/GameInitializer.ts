import ccclass = cc._decorator.ccclass;
import {GameManager} from "./GameManager";

@ccclass
export class GameInitializer extends cc.Component {
    protected onLoad() {
        GameManager.instance.initialize();
    }
}