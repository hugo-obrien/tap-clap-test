import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ConfigLoader} from "../configs/ConfigLoader";
import {GameManager} from "../managers/GameManager";
import {SceneManager, SceneName} from "../managers/SceneManager";

@ccclass
export class LoadingScreen extends cc.Component {
    @property(cc.Label)
    loadingLabel: cc.Label = null;

    @property((cc.Node))
    loadingSpinner: cc.Node = null;

    async onLoad() {
        if (this.loadingLabel) {
            this.loadingLabel.string = "Loading...";
        }

        try {
            if (!ConfigLoader.instance.isLoaded) {
                await ConfigLoader.instance.loadConfig();
            }

            await GameManager.instance.initialize();

            SceneManager.instance.loadScene(SceneName.TOWN_HALL);
        } catch (error) {
            cc.error(`LoadingScreen: Initialization failed: ${error.message}`);
            if (this.loadingLabel) {
                this.loadingLabel.string = "Failed to load game."
            }
        }
    }
}