import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {BuildingEconomyService} from "../buildings/BuildingEconomyService";
import {GameEvent, GlobalEvent} from "../core/GlobalEvent";
import {BuildingConfigLoader} from "../data/BuildingConfigLoader";
import {BuildingRepository} from "../buildings/BuildingRepository";
import {GameManager} from "../core/managers/GameManager";

@ccclass
export class BuildingUIItem extends cc.Component {
    @property(cc.Label)
    private nameLabel: cc.Label = null;
    @property(cc.Label)
    private levelLabel: cc.Label = null;
    @property(cc.Label)
    private costLabel: cc.Label = null;
    @property(cc.Label)
    private incomeLabel: cc.Label = null;

    @property(cc.Button)
    private actionButton: cc.Button = null;
    @property(cc.Label)
    private actionButtonLabel: cc.Label = null;

    private _configId: string = '';
    private _economy: BuildingEconomyService = new BuildingEconomyService();

    public initialize(config: string): void {
        this._configId = config;
        this.refreshAll();
    }

    protected onLoad() {
        if (this.actionButton) {
            this.actionButton.node.on(cc.Node.EventType.TOUCH_END, this.onActionClicked, this);
        }

        GlobalEvent.on(GameEvent.SCORE_CHANGED, this.refreshButtonState, this);
        GlobalEvent.on(GameEvent.BUILDING_UPGRADED, this.onBuildingUpgraded, this);
    }

    protected onDestroy() {
        if (this.actionButton) {
            this.actionButton.node.off(cc.Node.EventType.TOUCH_END, this.onActionClicked, this);
        }

        GlobalEvent.off(GameEvent.SCORE_CHANGED, this.refreshButtonState, this);
        GlobalEvent.off(GameEvent.BUILDING_UPGRADED, this.onBuildingUpgraded, this);
    }

    private onActionClicked() {
        const config = BuildingConfigLoader.instance.getConfig(this._configId);
        const building = BuildingRepository.instance.getBuilding(this._configId);

        if (!this._economy.canUpgrade(config, building.level, GameManager.instance.score)) {
            return;
        }

        const cost = this._economy.getUpgradeCost(config, building.level);
        GameManager.instance.addScore(-cost);

        BuildingRepository.instance.upgradeBuilding(this._configId);
    }

    private onBuildingUpgraded(configId: string) {
        if (configId === this._configId) {
            this.refreshAll();
        }
    }

    private refreshAll() {
        const config = BuildingConfigLoader.instance.getConfig(this._configId);
        const building = BuildingRepository.instance.getBuilding(this._configId);

        this.nameLabel.string = config.displayName;
        this.levelLabel.string = building.level.toString();

        const cost = this._economy.getUpgradeCost(config, building.level);
        this.costLabel.string = this.formatNumber(cost);

        const income = this._economy.getIncomePerSecond(config, building.level + 1);
        this.incomeLabel.string = `+${income}/s`;

        this.actionButtonLabel.string = building.isPurchased ? 'Upgrade' : 'Buy';

        this.refreshButtonState();
    }

    private refreshButtonState() {
        const config = BuildingConfigLoader.instance.getConfig(this._configId);
        const building = BuildingRepository.instance.getBuilding(this._configId);

        this.actionButton.interactable = this._economy.canUpgrade(config, building.level, GameManager.instance.score);
    }

    private formatNumber(value: number): string {
        if (value === Infinity) return '∞';
        return value.toString();
    }
}