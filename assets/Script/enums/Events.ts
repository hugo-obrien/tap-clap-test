export enum Events {
    TILE_CLICKED = 'TILE_CLICKED',
    MOVES_UPDATED = 'MOVES_UPDATED'
}

export interface TurnFinishedPayload {
    currentScore: number;
    scoreNeeded: number;
    turnsLeft: number
}