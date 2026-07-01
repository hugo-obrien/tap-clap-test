import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {BuildingConfigLoader} from "../data/BuildingConfigLoader";
import {BuildingUIItem} from "../ui/BuildingUIItem";
import {OfflineIncomeCalculator} from "../buildings/OfflineIncomeCalculator";
import {GameManager} from "../core/managers/GameManager";

@ccclass
export class BuildMoveScene extends cc.Component {
    @property(cc.Prefab)
    private buildingItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    private buildingContainer: cc.Node = null;

    @property(cc.Node)
    private offlineRewardPopup: cc.Node = null;

    @property(cc.Label)
    private offlineRewardLabel: cc.Label = null;

    @property(cc.Button)
    private closeOfflinePopupButton: cc.Button = null;

    protected onLoad() {
        this.createBuildingItems();
        this.showOfflineReward();
    }

    private createBuildingItems() {
        const configs = BuildingConfigLoader.instance.getAllConfigs();

        for (const config of configs) {
            const itemNode = cc.instantiate(this.buildingItemPrefab);
            this.buildingContainer.addChild(itemNode);

            const item = itemNode.getComponent(BuildingUIItem);
            item.initialize(config.id);
        }
    }

    private showOfflineReward() {
        const calculator = new OfflineIncomeCalculator();
        const result = calculator.calculate();

        if (result.gold > 0) {
            GameManager.instance.addScore(result.gold);

            const timeString = calculator.formatTime(result.seconds);
            this.offlineRewardLabel.string = `${timeString}\n${result.gold}`;
            this.offlineRewardPopup.active = true;

            if (this.closeOfflinePopupButton) {
                this.closeOfflinePopupButton.node.on(cc.Node.EventType.TOUCH_END, this.hideOfflinePopup, this);
            }
        }
    }

    private hideOfflinePopup() {
        this.offlineRewardPopup.active = false;
    }
}