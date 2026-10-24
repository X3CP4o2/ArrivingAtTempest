export const CELL_WIDTH = 16;
export const CELL_UNIT = 256;
export const CELL_LENGTH = CELL_WIDTH * CELL_UNIT;

export class Cell {

    occupied = false;
    
    constructor(readonly gridX: number, readonly gridY: number, readonly minBounds: Vector, readonly maxBounds: Vector, readonly cellNumber: number){

    }

    forEntities( func: (entity: CBaseEntity) => void){
        let currentEntity = Entities.First();
        let origin = currentEntity.GetAbsOrigin();
        do {
            if(origin.x < this.minBounds.x || origin.x > this.maxBounds.x){
                continue;
            }
            if(origin.y < this.minBounds.y || origin.y > this.maxBounds.y){
                continue;
            }
            func(currentEntity);
        } while( (currentEntity = Entities.Next(currentEntity)!) != null);
    }
}