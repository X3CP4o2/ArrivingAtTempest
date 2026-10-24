export enum DungeonDaytime {
    DAY = "day",
    NIGHT = "night"
}

interface DungeonData {
    name: string;
    tileSet: string;
    levels: number;
    disableDayNight: boolean;
    daytime: DungeonDaytime;
}

interface SpawnGroup {
    [name: string] : SpawnUnit[];
}

interface SpawnUnit {

}

export const DungeonDefinition = {
    
}