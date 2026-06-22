export enum Events {
    TILE_CLICKED = 'TILE_CLICKED',
    MOVES_UPDATED = 'MOVES_UPDATED',
    FLYING_SCORE = 'FLYING_SCORE',
    GAME_OVER = 'GAME_OVER',
    SHUFFLE = 'SHUFFLE',
}

export interface TurnFinishedPayload {
    currentScore: number;
    scoreNeeded: number;
    turnsLeft: number
}

export interface FlyingScorePayload {
    tile: cc.Node;
    score: number;
}