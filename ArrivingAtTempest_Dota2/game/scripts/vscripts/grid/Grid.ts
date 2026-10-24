import { Cell, CELL_LENGTH } from "./Cell";

export class Grid {
    private readonly cells: Cell[] = [];

    readonly width: number;
    readonly height: number;

    readonly xCellCount: number;
    readonly yCellCount: number;

    readonly cellCount: number;

    constructor(readonly min: Vector, readonly max: Vector){
        this.min = min;
        this.max = max;

        if( ! (this.isMod64(min.x) && this.isMod64(min.y) && this.isMod64(max.x) && this.isMod64(max.y)) ){
            print("ERROR: One of the provided min/max vectors is not base 64");
            print(min, max);
        }

        this.width =  min.x * -(1) + max.x;
        this.height = min.y * -(1) + max.y;

        this.xCellCount = Math.round(this.width / CELL_LENGTH);
        this.yCellCount = Math.round(this.height / CELL_LENGTH);

        this.cellCount = this.xCellCount * this.yCellCount;

        print("World cell count: ", this.cellCount);

        this.createCells();
    }

    private isMod64(value: number){
        return value % 64 == 0;
    }

    private createCells(){
        for(let x = 0; x < this.xCellCount; x++){
            const minX = this.min.x + CELL_LENGTH * x;

            for(let y = 0; y < this.yCellCount; y++){
                const index = x * this.xCellCount + y;

                const minY = this.min.y + CELL_LENGTH * y;

                const minBounds = Vector(minX, minY, 0);
                const maxBounds = Vector(minX + CELL_LENGTH, minY + CELL_LENGTH, 0);

                // print(minBounds, maxBounds);
                this.cells[index] = new Cell(x, y, minBounds, maxBounds, index);
            }
        }
    }

    public getCellByCoords(x: number, y: number) {
        const index = x * this.xCellCount + (y + 1);
        return this.cells[index];
    }

    public getCellByIndex(index: number){
        return this.cells[index];
    }

}