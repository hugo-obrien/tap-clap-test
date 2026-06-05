import {Tile} from "./Tile";
import {TileBlueprint} from "./TileBlueprint";

export class Grid {
    public width: number;
    public height: number;
    public tiles: (Tile|null)[][];

    private readonly availableBlueprints: TileBlueprint[];

    constructor(width: number, height: number, blueprints: TileBlueprint[]) {
        this.width = width;
        this.height = height;
        this.availableBlueprints = blueprints;
        this.tiles = [];
        this.initialize();
    }

    public getTile(row: number, col: number): Tile | null {
        if (row >= 0 && row < this.height && col >=0 && col < this.width) {
            return this.tiles[row][col];
        }
        return null;
    }

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
                const randomBlueprint = this.availableBlueprints[Math.floor(Math.random()*this.availableBlueprints.length)];
                this.tiles[r][c] = new Tile(randomBlueprint, r, c);
            }
        }
    }
}