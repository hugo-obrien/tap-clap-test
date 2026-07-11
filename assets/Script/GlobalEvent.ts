export const GlobalEvent = new cc.EventTarget();

export enum GameEvent {
    SCORE_CHANGED = 'GameEvent:ScoreChanged',
    WORKERS_CHANGED = 'GameEvent:WorkersChanged'
}