import { DOTA2_CLASSNAMES } from "../utils/utils";
import type { Dungeon } from "./Dungeon";
import { ChestSpawner, CreateSpawner, SpawnerName, SpecialSpawner, UnitSpawner } from "./Spawner";
import { CreateTileConnectionFromInfoTarget, TileConnectionInfoTarget } from './TileDefinition';

export enum DungeonMarkerName {
    BREAKABLE = "breakable",
    CHECKPOINT = "checkpoint",
    TRAP = "trap",
    EXIT = "exit",
    ENTRY = "entry",
    CONNECTION = "con",
    TELEPORTER = "teleporter"
}

export class DungeonTile {
    public static TileCount = 0;

    private spawnGroupHandle!: SpawnGroupHandle;
    private tileCount = ++DungeonTile.TileCount;

    private entities: CBaseEntity[] = [];
    private triggers: CBaseTrigger[] = [];

    private checkpoint!: CBaseEntity | undefined;
    private entry!: CBaseEntity | undefined;
    private exit!: CBaseEntity | undefined;

    private unitSpawners: UnitSpawner[] = [];
    private chestSpawners: ChestSpawner[] = [];
    private specialSpawners: SpecialSpawner[] = [];

    private connections: TileConnectionInfoTarget[] = [];

    private teleporters: CBaseTrigger[] = [];
    private breakables: CBaseEntity[] = [];
    private traps: CBaseTrigger[] = [];
    private chests: CBaseEntity[] = [];
    private units: CBaseEntity[] = [];

    constructor(public tileName: string, public origin: Vector, public readonly dungeon: Dungeon) {}

    spawnTile(callback: Function) {
        DOTA_SpawnMapAtPosition(this.tileName, this.origin, false, this.onReadyToSpawn, (spawnGroupHandle: SpawnGroupHandle) => {
            this.onSpawnComplete(spawnGroupHandle);
            callback();
        }, this);
    }

    despawnTile(){
        UnloadSpawnGroupByHandle(this.spawnGroupHandle);
    }

    private onReadyToSpawn = (spawnGroupHandle: SpawnGroupHandle) => {
    }

    private onSpawnComplete = (spawnGroupHandle: SpawnGroupHandle) => {
        this.spawnGroupHandle = spawnGroupHandle;

        let currentEntity = Entities.First();

        do {
            if (currentEntity.GetSpawnGroupHandle() != this.spawnGroupHandle) {
                continue;
            }

            const entityClass = currentEntity.GetClassname();

            switch (entityClass) {
                case DOTA2_CLASSNAMES.INFO_TARGET: this.handleInfoTarget(currentEntity); break;
                case DOTA2_CLASSNAMES.TRIGGER: this.handleTrigger(currentEntity as CBaseTrigger); break;
                case DOTA2_CLASSNAMES.CREATURE: this.handleCreature(currentEntity); break;
                default: print("No class default case for: ", entityClass, currentEntity.GetName()); continue;
            }

            this.entities.push(currentEntity);
        } while ((currentEntity = Entities.Next(currentEntity)!) != undefined)
    }

    private handleCreature(entity: CBaseEntity) {
        switch (entity.GetName()) {
            case DungeonMarkerName.BREAKABLE: this.breakables.push(entity); break;
            default: print("No creature default case for: ", entity.GetName());
        }
    }

    private handleTrigger(entity: CBaseTrigger) {
        this.triggers.push(entity);
        switch (entity.GetName()) {
            case DungeonMarkerName.CHECKPOINT: this.checkpoint = entity; break;
            case DungeonMarkerName.TRAP: this.traps.push(entity); break;
            case DungeonMarkerName.EXIT: this.exit = entity; break;
            case DungeonMarkerName.ENTRY: this.entry = entity; break;
            case DungeonMarkerName.TELEPORTER: this.teleporters.push(entity); break;
            default: print("No trigger default case for: ", entity.GetName());
        }
    }

    private handleInfoTarget(entity: CBaseEntity) {
        const splitName = entity.GetName().split('_');

        switch (splitName[0]) {
            case DungeonMarkerName.CONNECTION: this.connections.push(CreateTileConnectionFromInfoTarget(entity, splitName)); break;
            case SpawnerName.UNIT: this.unitSpawners.push(CreateSpawner(entity, splitName) as UnitSpawner); break;
            case SpawnerName.CHEST: this.chestSpawners.push(CreateSpawner(entity, splitName) as ChestSpawner); break;
            case SpawnerName.SPECIAL: this.specialSpawners.push(CreateSpawner(entity, splitName) as SpecialSpawner); break;
            default: print("No infotarget default case for: ", entity.GetName());
        }
    }

    private findEntities(entities: CBaseEntity[]): CBaseEntity[] {
        const foundEntities: CBaseEntity[] = [];

        if (!this.spawnGroupHandle) {
            print("Tile ", this.tileName, " not spawned!");
            return foundEntities;
        }

        for (let entity of entities) {
            if (entity.GetSpawnGroupHandle() == this.spawnGroupHandle) {
                foundEntities.push(entity);
            }
        }
        return foundEntities;
    }

    findEntitiesByClass(className: string, warnIfNotFound = false): CBaseEntity[] {
        const entities = this.findEntities(Entities.FindAllByClassname(className));

        if (warnIfNotFound && entities.length == 0) {
            print("Could not find any ", className, " in tile ", this.toString());
        }

        return entities;
    }

    findEntitiesByName(entityName: string, warnIfNotFound = false): CBaseEntity[] {
        const entities: CBaseEntity[] = this.findEntities(Entities.FindAllByName(entityName));

        if (warnIfNotFound && entities.length == 0) {
            print("Could not find any ", entityName, " in tile ", this.toString());
        }

        return entities;
    }

    toString() {
        return this.tileName + "(" + this.tileCount + ")" + "@[" + this.origin.toString() + "]";
    }
}