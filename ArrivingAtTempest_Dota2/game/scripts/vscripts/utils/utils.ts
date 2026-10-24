import { DotaPromise } from "./DotaPromise";

export enum DOTA2_CLASSNAMES {
    INFO_TARGET = "info_target",
    NPC_SPAWNER = "npc_dota_spawner",
    TRIGGER = "trigger_dota",
    CREATURE = "npc_dota_creature",
    THINKER = "npc_dota_thinker",
    BASE_ADDITIVE = "npc_dota_base_additive"
}


export function retryFunc(times: number, interval: number, func: () => boolean, initDelay = 0) {
    Timers.CreateTimer(initDelay, () => {
        if (times <= 0) {
            return;
        }
        times--;
        if (func()) {
            return;
        }
        return interval;
    });
}

export function RotateVector2D(vector: Vector, theta: number){
    const xp = vector.x*math.cos(theta)-vector.y*math.sin(theta)
    const yp = vector.x*math.sin(theta)+vector.y*math.cos(theta)
    return Vector(xp,yp,vector.z).Normalized()
}

export function ToRadians(degrees: number){
	return degrees * math.pi / 180
}

export function ToDegrees(radians: number){
	return radians * 180 / math.pi 
}

export function deepcopy<T>(orig: T): T{
    const originalType = type(orig);
    let copy: T;

    if(originalType == 'table'){
        copy = {} as T;
        for(let [origKey, origValue] of next(orig as any)){
            copy[deepcopy<keyof T>(origKey as keyof T)] = deepcopy(origValue);
        }
    } else {
        copy = orig;
    }
    return copy;
}

export function CopyArrayShallow<T>(array: T[]): T[]{
    const result: T[] = [];

    for(let i = 0; i < array.length; i++){
        result[i] = array[i];
    }

    return result;
}
  