import { CELL_WIDTH } from "../grid/Cell";


export enum TileConnectionDirection {
    TOP = "top",
    LEFT = "left",
    RIGHT = "right",
    BOTTOM = "bottom"
}

export enum TileRotation {
    TOP,
    LEFT,
    RIGHT,
    BOTTOM
}

export enum TileconnectionSize {
    SMALL = 1,
    MEDIUM = 2,
    LARGE = 3,
    FULL = CELL_WIDTH
}

export enum TileType {
    ENTRY = "entry",
    CURVE = "curve",
    STRAIGHT = "straight",
    CROSSROAD = "cross",
    FORK = "fork",
    DEADEND = "deadend"
}

export interface TileConnection {
    size: TileconnectionSize,
    direction: TileConnectionDirection
}

export interface TileConnectionInfoTarget extends TileConnection{
    entity: CBaseEntity
}

export interface TileDefinition {
    path: string,
    tileBounds: Vector,
    sizes: TileconnectionSize[],
    directions: TileConnectionDirection[],
    rotations: TileRotation[],
    heightConform: boolean
}

type Level = number;

/**
 * Higher levels will use lower levels if necessary
 */
export const TileDefinitions: Record<string, Record<Level, Partial<Record<TileType, TileDefinition>>>> = {
    "radiant_cavern": {
        1: {
            [TileType.ENTRY]: {
                path: "variation1",
                tileBounds: Vector(4098, 4098, 0),
                sizes: [TileconnectionSize.MEDIUM, TileconnectionSize.MEDIUM, TileconnectionSize.SMALL],
                directions: [TileConnectionDirection.LEFT, TileConnectionDirection.TOP, TileConnectionDirection.RIGHT],
                rotations: [TileRotation.BOTTOM, TileRotation.LEFT, TileRotation.TOP, TileRotation.RIGHT],
                heightConform: false
            }
        }
    }
}

export function CreateTileConnectionFromInfoTarget(entity: CBaseEntity, splitName: string[]): TileConnectionInfoTarget {
    return {
        entity: entity,
        size: tonumber(splitName[2]) as TileconnectionSize,
        direction: splitName[1] as TileConnectionDirection
    }
}