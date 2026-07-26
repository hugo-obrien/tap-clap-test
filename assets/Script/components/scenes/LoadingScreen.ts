import {ConfigLoader} from "../../configs/ConfigLoader";
import {GameManager} from "../../managers/GameManager";
import {SceneManager, SceneName} from "../../managers/SceneManager";
import {BuiltinCommands} from "../../debug/commands/BuiltinCommands";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

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

            if (CC_DEBUG) {
                await this.loadDebugConsole();
            } else {
                cc.log('LoadingScreen. CC_DEBUG failed');
            }

            SceneManager.instance.loadScene(SceneName.TOWN_HALL);
        } catch (error) {
            cc.error(`LoadingScreen: Initialization failed: ${error.message}`);
            if (this.loadingLabel) {
                this.loadingLabel.string = "Failed to load game."
            }
        }
    }

    private async loadDebugConsole(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            cc.log('LoadingScreen: Loading DebugConsole...');

            cc.resources.load('prefabs/DebugConsole', cc.Prefab, (err, prefab) => {
                if (err) {
                    cc.error(`LoadingScreen: Failed to load DebugConsole: ${err.message}`);
                    reject(err);
                    return;
                }

                try {
                    const consoleNode = cc.instantiate(prefab);
                    consoleNode.name = 'DebugConsoleRoot';

                    cc.game.addPersistRootNode(consoleNode);

                    BuiltinCommands.registerAll();
                    resolve();

                } catch (error) {
                    cc.error(`LoadingScreen: Failed to setup DebugConsole: ${error.message}`);
                    reject(error);
                }
            });
        });
    }
}