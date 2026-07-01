export const GlobalEvent = new cc.EventTarget();

export enum GameEvent {
    SCORE_CHANGED = 'GameEvent:ScoreChanged',
    BUILDING_UPGRADED = 'GameEvent:BuildingUpgraded',
    BUILDINGS_LOADED = 'GameEvent:BuildingsLoaded'
}