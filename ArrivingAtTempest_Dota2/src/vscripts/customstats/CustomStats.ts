import { CustomGameTableName } from '../enums/enums';
import { ServerTablesManager, NetTable } from '../lib/customgametables';
import { modifier_stats } from '../modifiers/modifier_stats';
import { Stat } from './Stat';
import { OffensiveTypeIdentifier } from './CustomDamage';

interface FunctionStats {
    function: (
        customData: CustomStats,
        stats: { [key: string]: Stat },
        params: Record<string, any>,
        values: Record<string, any>
    ) => void;
    params: Record<string, any>;
    values: Record<string, any>;
}

type StatRecord = Record<string, number[]>;

const getAddOrSubtractFunction = (subtract: boolean) => subtract ? (a: number, b: number) => a - b : (a: number, b: number) => a + b;

export function GetCorrectPropertyIndices(currentLevel: number, maxLevel: number, range: number) {
    const result = {
        from: 1,
        to: 1
    }

    const currentIndex = currentLevel;

    if (currentLevel == 1) {
        result.from = 1;
        result.to = math.min(range, maxLevel);
    } else if (currentLevel == maxLevel) {
        result.from = math.max(1, maxLevel - range - 1);
        result.to = maxLevel;
    } else {
        const halfRange = range / 2;
        result.from = math.max(1, currentIndex - halfRange);
        result.to = math.min(currentIndex + halfRange, maxLevel);
    }

    return result;
}

export class CustomStats {
    static DEFAULT_RANGE = 3;

    entityIndex: EntityIndex;
    offensiveType = OffensiveTypeIdentifier.ATTACK;
    isNpc = false;

    level = 1;

    statTable: { [key: string]: Stat } = {};
    statNetTable!: NetTable<CustomGameTableName.CUSTOM_STATS, Record<string, number[]>>;

    functionTable: FunctionStats[] = [];

    perks = {};
    statsModifier!: modifier_stats;

    defaultStatNetTableExtractionFunction = (data: Record<string, number[]>) => {
        const result: Record<string, number[]> = {};

        let trimIndices = GetCorrectPropertyIndices(this.level, this.maxLevel, CustomStats.DEFAULT_RANGE);
        const from = math.min(this.maxLevel, trimIndices.from);
        const to = math.min(this.maxLevel, trimIndices.to);

        for (let [key, values] of pairs(data)) {
            result[key] = [];
            for (let i = from; i <= to; i++) {
                result[key][i - 1] = values[i - 1];
            }
        }

        return result;
    };

    constructor(public script: CDOTA_BaseNPC | CDOTA_Ability_Lua | CDOTA_Item_Lua, public dummyData = false, public dummyDamage = false, public maxLevel = 15, entityIndex?: EntityIndex, level?: number, data?: Record<string, number[]>) {
        this.entityIndex = entityIndex || script.GetEntityIndex();
        this.isNpc = script.IsBaseNPC();
        this.level = level || script.GetLevel();

        if (dummyData) {
            this.statNetTable = new NetTable(
                {
                    identifier: "",
                    type: CustomGameTableName.CUSTOM_STATS,
                    playerId: -1,
                    shared: false,
                }, ServerTablesManager);
        } else {
            this.statNetTable = ServerTablesManager.createTable<CustomGameTableName.CUSTOM_STATS, StatRecord>(
                {
                    type: CustomGameTableName.CUSTOM_STATS,
                    shared: true,
                    identifier: tostring(this.entityIndex)
                },
                {},
                this.defaultStatNetTableExtractionFunction);
        }

        if (data) {
            this.setBases(data);
        }
    }

    public static createBasicDummyData(damageTable: Record<string, number[]>, inflictor: CBaseEntity, level = 1, dummyDamage = false) {
        return new CustomStats(
            <any>inflictor,
            true,
            dummyDamage,
            15,
            inflictor.GetEntityIndex(),
            level,
            damageTable
        );
    }

    getForCurrentLevel(propertyName: string) {
        const values = this.statNetTable.getValue(propertyName);
        if (!values) {
            return null;
        }
        return values[this.level];
    }

    getCurrentData(): Record<string, number> {
        let data = this.statNetTable.getWithDelta();

        let result: Record<string, number> = {};

        for (let [key, value] of pairs(data)) {
            result[key] = value[this.level];
        }

        return result;
    }

    getData(): Record<string, number[]> {
        return this.statNetTable.getWithDelta();
    }

    getOrCreateStat(key: string) {
        if (!this.statTable[key]) {
            this.statTable[key] = new Stat(this.maxLevel);
        }
        return this.statTable[key];
    }

    calculateCombinedStats = () => {
        this.applyFunctionStats();

        for (let statName in this.statTable) {
            const stat = this.statTable[statName];
            if (stat.isCombinedDirty()) {
                this.statNetTable.setValue(statName, stat.combined);
                stat.clearCombinedFlag();
            }
        }
    }

    /**
     * Further modifies Stat->combined values
     */
    applyFunctionStats() {
        for (let functionStat of this.functionTable) {
            functionStat.function(this, this.statTable, functionStat.params, functionStat.values);
        }
    }

    refreshCombinedStats(skipBroadcast = false) {
        this.calculateCombinedStats();

        this.refreshStatsModifier();

        if (skipBroadcast) {
            return;
        }

        if (!this.dummyData) {
            this.statNetTable.flush(true);
        }
        this.statNetTable.applyDelta();
    }

    refreshStatsModifier() {
        if (this.isNpc && this.script) {
            if (!this.statsModifier) {
                this.statsModifier = this.statsModifier || (<CDOTA_BaseNPC>this.script).AddNewModifier(this.script as CDOTA_BaseNPC_Hero, undefined, "modifier_stats", {}) as modifier_stats;   
            }
            if ((<CDOTA_BaseNPC>this.script).IsHero()) {
                (<CDOTA_BaseNPC_Hero>this.script).CalculateStatBonus(false);
            } else {
                this.statsModifier.ForceRefresh();
            }
        }
    }

    setBases(toBeSet: Record<string, number[]>, skipRefresh = false, skipBroadcast = false) {
        for (let key in toBeSet) {
            const value = toBeSet[key];
            if (!value) {
                continue;
            }
            const stat = this.getOrCreateStat(key);
            stat.base = value;
            stat.combine();
        }
        if (skipRefresh) {
            return;
        }
        this.refreshCombinedStats(skipBroadcast);
    }

    addModifiers(toBeAdded: Record<string, number>, skipRefresh = false, skipBroadcast = false) {
        this._addModifiers(toBeAdded, false, skipRefresh, skipBroadcast);
    }

    subtractModifiers(toBeRemoved: Record<string, number>, skipRefresh = false, skipBroadcast = false) {
        this._addModifiers(toBeRemoved, true, skipRefresh, skipBroadcast);
    }

    private _addModifiers(toBeAdded: Record<string, number>, subtract = false, skipRefresh = false, skipBroadcast = false) {
        const addFunction = getAddOrSubtractFunction(subtract);

        for (let key in toBeAdded) {
            const value = toBeAdded[key];
            if (!value) {
                continue;
            }
            const stat = this.getOrCreateStat(key);

            stat.modifier = stat.modifier.map(modifier => addFunction(modifier, value));
            stat.combine();
        }

        if (skipRefresh) {
            return;
        }
        this.refreshCombinedStats(skipBroadcast);
    }

    addModifiersArray(toBeAdded: Record<string, number[]>, skipRefresh = false, skipBroadcast = false) {
        this._addModifiersArray(toBeAdded, false, skipRefresh, skipBroadcast);
    }
    subtractModifiersArray(toBeRemoved: Record<string, number[]>, skipRefresh = false, skipBroadcast = false) {
        this._addModifiersArray(toBeRemoved, true, skipRefresh, skipBroadcast);
    }

    private _addModifiersArray(toBeAdded: Record<string, number[]>, subtract = false, skipRefresh = false, skipBroadcast = false) {
        const addFunction = getAddOrSubtractFunction(subtract);

        for (let key in toBeAdded) {
            const currentArray = toBeAdded[key];
            if (!currentArray) {
                continue;
            }
            const stat = this.getOrCreateStat(key);



            stat.modifier = stat.modifier.map((modifier, index) => addFunction(modifier, currentArray[index] || 0));
            stat.combine();
        }

        if (skipRefresh) {
            return;
        }

        this.refreshCombinedStats(skipBroadcast);
    }
}