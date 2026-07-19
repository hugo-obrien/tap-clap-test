import ccclass = cc._decorator.ccclass;
import {GameManager} from "./managers/GameManager";

@ccclass
export class GameInitializer extends cc.Component {
    protected async onLoad() {
        if (!GameManager.instance.isInitialized) {
            cc.warn(`GameInitializer: GameManager not initialized, initializing now...`);
            await GameManager.instance.initialize();
        }
    }
}