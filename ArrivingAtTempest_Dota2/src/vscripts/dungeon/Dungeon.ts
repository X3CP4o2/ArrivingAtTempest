import type { DungeonTile } from './DungeonTile';

export class Dungeon{
    private tileCount = 0;

    private tiles: Record<SpawnGroupHandle, DungeonTile> = {};

    constructor(){
        
    }


    public getTileByHandle(handle: SpawnGroupHandle){
        // return this.tiles[handle];
    }
}