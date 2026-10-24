interface Spawner {
    entity: CBaseEntity;
}

export enum SpawnerName {
    UNIT = "spawner",
    CHEST = "chest",
    SPECIAL = "special"
}

export enum UnitSpawnerSize {
    SINGLE = "single",
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large"
}

export interface UnitSpawner extends Spawner{
    size: UnitSpawnerSize;
    identifier: string;
}

export enum ChestQuality {
    LEGENDARY = 1,
    RARE = 2,
    MAGIC = 3,
    COMMON = 4
}

export enum ChestAppearance {
    STATIC = "static",
    VARIABLE = "variable"
}

export interface ChestSpawner extends Spawner{
    appearance: ChestAppearance;
    quality: ChestQuality;
}

export interface SpecialSpawner extends Spawner{
    identifier: string;
}

export function CreateSpawner<T extends Spawner>(entity: CBaseEntity, splitInfo: string[]): T | undefined{
    switch(splitInfo[0]){
        case SpawnerName.UNIT: return <any>createUnitSpawner(entity, splitInfo);
        case SpawnerName.CHEST: return <any>createChestSpawner(entity, splitInfo);
        case SpawnerName.SPECIAL: return <any>createSpecialSpawner(entity, splitInfo);
        default: return;
    }
}

function createUnitSpawner(entity: CBaseEntity, splitInfo: string[]): UnitSpawner {
    return {
        entity: entity,
        size: splitInfo[1] as UnitSpawnerSize,
        identifier: splitInfo[2]
    }
}

function createChestSpawner(entity: CBaseEntity, splitInfo: string[]): ChestSpawner {
    return {
        entity: entity,
        appearance: splitInfo[1] as ChestAppearance,
        quality: tonumber(splitInfo[2]) as ChestQuality
    }
}

function createSpecialSpawner(entity: CBaseEntity, splitInfo: string[]): SpecialSpawner{
    return {
        entity: entity,
        identifier: splitInfo[1]
    }
}