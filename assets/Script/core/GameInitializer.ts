import ccclass = cc._decorator.ccclass;
import {GameManager} from "./managers/GameManager";
import {BuildingConfigLoader} from "../data/BuildingConfigLoader";
import {BuildingRepository} from "../buildings/BuildingRepository";
import {SaveManager} from "./managers/SaveManager";

@ccclass
export class GameInitializer extends cc.Component {

    async onLoad() {
        try {
            await BuildingConfigLoader.instance.load();
        } catch (err) {
            cc.error('GameInitializer.onLoad(): Failed to load configs');
            return;
        }

        GameManager.instance.initialize();
        BuildingRepository.instance.initialize();

        SaveManager.instance.saveLastTick(Date.now());
    }
}