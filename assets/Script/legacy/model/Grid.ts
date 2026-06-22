import {Tile} from "./Tile";
import {TileBlueprint} from "./TileBlueprint";
import {Utils} from "../utils/Utils";

export class Grid {
    public width: number;
    public height: number;
    public tiles: (Tile | null)[][];

    private readonly availableBlueprints: TileBlueprint[];
    private readonly bonusBlueprints: TileBlueprint[];

    constructor(width: number, height: number, blueprints: TileBlueprint[], bonusBlueprints: TileBlueprint[]) {
        this.width = width;
        this.height = height;
        this.availableBlueprints = blueprints;
        this.bonusBlueprints = bonusBlueprints;
        this.tiles = [];
        this.initialize();
    }

    public getTile(row: number, col: number): Tile | null {
        if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
            return this.tiles[row][col];
        }
        return null;
    }

    public getNeighbors(tile: Tile): Tile[] {
        const neighbors: Tile[] = [];

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const neighbor = this.getTile(tile.row + dr, tile.col + dc);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }


    public removeTiles(tilesToRemove: Set<Tile>) {
        tilesToRemove.forEach(item => this.tiles[item.row][item.col] = null);
    }

    public applyGravity(): Tile[] {
        const movedTiles: Tile[] = [];
        for (let c = 0; c < this.width; c++) {
            let writeRow = this.height - 1;

            for (let r = this.height - 1; r >= 0; r--) {
                if (this.tiles[r][c] !== null) {
                    const tile = this.tiles[r][c];

                    if (r === writeRow) {
                        writeRow--;
                        continue;
                    }

                    this.tiles[writeRow][c] = tile;
                    this.tiles[r][c] = null;

                    tile.row = writeRow;
                    tile.col = c;
                    movedTiles.push(tile);

                    writeRow--;
                }
            }
        }

        return movedTiles;
    }

    public refill(): Tile[] {
        const newTiles: Tile[] = [];

        for (let c = 0; c < this.width; c++) {
            for (let r = 0; r < this.height; r++) {
                if (this.tiles[r][c] === null) {
                    const randomBlueprint = this.availableBlueprints[Math.floor(Math.random() * this.availableBlueprints.length)];
                    const newTile = new Tile(randomBlueprint, r, c);
                    this.tiles[r][c] = newTile;
                    newTiles.push(newTile);
                }
            }
        }

        return newTiles;
    }

    public getGroup(tile: Tile): Tile[] {
        const group: Tile[] = [];
        const visited = new Set<string>();
        const queue: Tile[] = [tile];
        const targetId = tile.blueprint.id;

        while (queue.length > 0) {
            const current = queue.shift()!;
            group.push(current);
            visited.add(current.key);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const key = neighbor.key;
                if (!visited.has(key) && neighbor.blueprint.id === targetId) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }

        return group;
    }

    public haveExistingTurns(minBlastGroupSize: number): boolean {
        const checked = new Set<string>;
        for (let c = 0; c < this.width; c++) {
            for (let r = 0; r < this.height; r++) {
                let tile = this.getTile(r, c);
                if (!tile) {
                    cc.warn(`GameManager.checkExistingTurns(). Tile ${r}:${c} is null`);
                    continue;
                } else if (checked.has(tile.key)) {
                    // ignoring
                    continue;
                }

                let group = this.getGroup(tile);
                if (group.length >= minBlastGroupSize) {
                    return true;
                }
                group.forEach(tile => checked.add(tile.key));
            }
        }

        return false;
    }

    public shuffle(minBlastGroupSize: number): Tile[] {
        // todo Add protection when the grid is small and there are many types of tiles
        const shuffled: Tile[] = [];
        for (let c = 0; c < this.width; c++) {
            for (let r = 0; r < this.height; r++) {
                const tile = this.tiles[r][c];
                shuffled.push(tile);
            }
        }

        Utils.shuffle(shuffled);

        for (const tile of shuffled) {
            this.tiles[tile.row][tile.col] = tile;
        }

        if (this.haveExistingTurns(minBlastGroupSize)) {
            return shuffled;
        } else {
            return this.shuffle(minBlastGroupSize);
        }
    }

    public createBonusTile(row: number, col: number): Tile {
        const bonusBlueprint = this.bonusBlueprints[Math.floor(Math.random() * this.bonusBlueprints.length)];
        let tile = new Tile(bonusBlueprint, row, col);
        this.tiles[row][col] = tile;
        return tile;
    }

    private initialize() {
        // todo Add protection when the grid is small and there are many types of tiles
        console.log('Begin initialize')
        if (!this.availableBlueprints || this.availableBlueprints.length == 0) {
            cc.warn('Grid.initialize() There are no available blueprints');
            return;
        }
        console.log('availableBlueprints check passed')

        for (let r = 0; r < this.height; r++) {
            this.tiles[r] = [];
            for (let c = 0; c < this.width; c++) {
                const randomBlueprint = this.availableBlueprints[Math.floor(Math.random() * this.availableBlueprints.length)];
                this.tiles[r][c] = new Tile(randomBlueprint, r, c);
            }
        }
    }
}