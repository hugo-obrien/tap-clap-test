import {Tile} from "./Tile";
import {TileBlueprint} from "./TileBlueprint";
import TiledTile = cc.TiledTile;

export class Grid {
    public width: number;
    public height: number;
    public tiles: (Tile | null)[][];

    private readonly availableBlueprints: TileBlueprint[];

    constructor(width: number, height: number, blueprints: TileBlueprint[]) {
        this.width = width;
        this.height = height;
        this.availableBlueprints = blueprints;
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

    /*public findConnectedGroup(startTile: Tile): Tile[] {
        const group: Tile[] = [];
        const visited = new Set<string>();
        const queue: Tile[] = [startTile];
        const targetId = startTile.blueprint.id;

        while (queue.length > 0) {
            const current = queue.shift()!;
            group.push(current);
            visited.add(current.getKey());

            const neighbors = this.getValidNeighbors(current.row, current.col);
            for (const neighbor of neighbors) {
                const key = neighbor.getKey();
                if (!visited.has(key) && neighbor.blueprint.id === targetId) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }

        for (const item of group) {
            cc.log(item.toString());
        }
        return group;
    }*/

    public removeTiles(tilesToRemove: Tile[]) {
        for (const tile of tilesToRemove) {
            this.tiles[tile.row][tile.col] = null;
        }
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

    /*private getValidNeighbors(row: number, col: number): Tile[] {
        const neighbors: Tile[] = [];
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        for (const [rowDirection, colDirection] of directions) {
            const targetRow = row + rowDirection;
            const targetCol = col + colDirection;
            const targetTile = this.getTile(targetRow, targetCol);
            if (targetTile) {
                neighbors.push(targetTile);
            }
        }

        return neighbors;
    }*/

    private initialize() {
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