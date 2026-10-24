import { PropertyNames, PROPERTY_TO_CATEGORIES, PROPERTY_CATEGORY, DAMAGE_TYPE_PROPERTIES, DAMAGE_TYPE_PREFIXES } from '../shared/stats';
import { showPopupDamageBlock, showPopupNumbers, Popup_Symbol_Post} from '../lib/Popups';
import { CustomStats } from './CustomStats';


/** 
    resistanceOptions = {
    Flat = bool  => flat value 
    Per  = bool  => percentage value 
    }
    
    attackOptions = {
    Flat = bool  => flat value 
    Per  = bool  => percentage value 
    }
    
    spellOptions = {
    Flat = bool  => flat value 
    Per  = bool  => percentage value 
    }
    globalOptions = {
    Flat = bool  => flat value 
    Per  = bool  => percentage value 
    }
    
    Output for "Physical", {flat = true, per = true}, ...
    {
        name = "Physical",
        damageFunction = x,
        resistance = {
            flat = "PhysicalResistanceFlat",
            percentage = "PhysicalResistancePer"
        },
        attack = {
            min = "AttackDamagePhysicalMin",
            max = "AttackDamagePhysicalMax",
            percentage = "AttackDamagePhysicalPer"
        },
        spell = {
            min = "SpellDamagePhysicalMin",
            max = "SpellDamagePhysicalMax",
            percentage = "SpellDamagePhysicalPer"
        },
        global = {
            min = "PhysicalDamageMin"
            max = "PhysicalDamageMax"
            percentage = "PhysicalDamagePer"
        }
    }
    damageFunction - Recieves defenseTable and calculated DamageTable
*/ 

interface DamageTypeData {
    name: string,
    color: Vector,
    resistance: {
        flat: string,
        percentage: string
    },
    [OffensiveTypeIdentifier.ATTACK]: {
        min: string,
        max: string,
        percentage: string
    },
    [OffensiveTypeIdentifier.SPELL]: {
        min: string,
        max: string,
        percentage: string
    },
    [OffensiveTypeIdentifier.GLOBAL]: {
        min: string,
        max: string,
        percentage: string
    },
    damageFunction: (defenseTable: Record<string, number>, damageTable: Record<string, number>, resultTable: Record<string, number>, offensiveType?: OffensiveTypeIdentifier) => void;
}

export const DAMAGE_TYPE_BY_NAME: { [key: string]: DamageTypeData } = {};
export const DAMAGE_TYPES_DATA: DamageTypeData[] = [];
export enum OffensiveTypeIdentifier {
    ATTACK = "attack",
    SPELL = "spell",
    GLOBAL = "global"
}

export enum CustomDamageTrigger{
    NO_TRIGGERS = DAMAGE_TYPES.DAMAGE_TYPE_PURE,
    BASIC = DAMAGE_TYPES.DAMAGE_TYPE_PHYSICAL,
    MAGIC = DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL,
    REMOVE_HP = DAMAGE_TYPES.DAMAGE_TYPE_HP_REMOVAL
}

type DamageFunction = (damageTypeData: DamageTypeData, defenseTable: Record<string, number>, damageTable: Record<string, number>, resultTable: Record<string, number>, offensiveType?: OffensiveTypeIdentifier) => void;


function AddPropertyCategories(name: PropertyNames | string, ...propertyCategories: PROPERTY_CATEGORY[]) {
    PROPERTY_TO_CATEGORIES[name] = propertyCategories;
    return name;
}

function defaultDamageFunction(damageTypeData: DamageTypeData, defenseTable: Record<string, number>, damageTable: Record<string, number>, resultTable: Record<string, number>, offensiveType?: OffensiveTypeIdentifier) {
    const damage = damageTable[damageTypeData.name];
    const defenseFlat = defenseTable[damageTypeData.resistance.flat];
    const defensePercent = defenseTable[damageTypeData.resistance.percentage] / 100;

    if (damage == 0) {
        resultTable[damageTypeData.name] = damage
        return;
    }

    resultTable[damageTypeData.name] = Math.max(0, damage - (damage * defensePercent) - defenseFlat);
}

function fillDamageTypeData(damageTypeName: string, colorData: number[], flags: PROPERTY_CATEGORY[], damageFunction: null | DamageFunction) {
    if (!damageTypeName) {
        print("ERROR: No damageTypeName");
        return;
    }
    let usedDamageFunction = damageFunction || defaultDamageFunction;

    const result: DamageTypeData = {
        name: damageTypeName,
        color: Vector(colorData[0], colorData[1], colorData[2]),
        resistance: {
            flat: AddPropertyCategories(damageTypeName + "ResistanceFlat", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.DEFENSE),
            percentage: AddPropertyCategories(damageTypeName + "ResistancePer", PROPERTY_CATEGORY.PERCENTAGE, PROPERTY_CATEGORY.DEFENSE)
        },
        attack: {
            min: AddPropertyCategories("AttackDamage" + damageTypeName + "Min", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.ATTACK),
            max: AddPropertyCategories("AttackDamage" + damageTypeName + "Max", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.ATTACK),
            percentage: AddPropertyCategories("AttackDamage" + damageTypeName + "Per", PROPERTY_CATEGORY.PERCENTAGE, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.ATTACK)
        },
        spell: {
            min: AddPropertyCategories("SpellDamage" + damageTypeName + "Min", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.CAST),
            max: AddPropertyCategories("SpellDamage" + damageTypeName + "Max", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.CAST),
            percentage: AddPropertyCategories("SpellDamage" + damageTypeName + "Per", PROPERTY_CATEGORY.PERCENTAGE, PROPERTY_CATEGORY.OFFENSIVE, PROPERTY_CATEGORY.CAST)
        },
        global: {
            min: AddPropertyCategories(damageTypeName + "DamageMin", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE),
            max: AddPropertyCategories(damageTypeName + "DamageMax", PROPERTY_CATEGORY.FLAT, PROPERTY_CATEGORY.OFFENSIVE),
            percentage: AddPropertyCategories(damageTypeName + "DamagePer", PROPERTY_CATEGORY.PERCENTAGE, PROPERTY_CATEGORY.OFFENSIVE)
        },
        damageFunction: (defenseTable: Record<string, number>, damageTable: Record<string, number>, resultTable: Record<string, number>, attackType?: OffensiveTypeIdentifier) => usedDamageFunction(result, defenseTable, damageTable, resultTable, attackType)
    }
    DAMAGE_TYPE_BY_NAME[damageTypeName] = result;

    return result;
}

for (let damageTypeProperty of DAMAGE_TYPE_PROPERTIES) {
    let damageTypeData = fillDamageTypeData(damageTypeProperty.name, damageTypeProperty.color, damageTypeProperty.flags, damageTypeProperty.damageFunc);
    if (damageTypeData) {
        DAMAGE_TYPES_DATA.push(damageTypeData);
    }
}

export class CustomDamage {

    constructor(gameMode?: CDOTABaseGameMode){
        if(gameMode){
            this.applyFilter(gameMode);
        }
    }

    public applyFilter = (gameMode: CDOTABaseGameMode) => {
        gameMode.SetDamageFilter(this.damageFilter, this);
    }
    /**
     * 	
     * CUSTOM_DAMAGE_NO_TRIGGERS = DAMAGE_TYPE_PURE
     * CUSTOM_DAMAGE_BASIC = DAMAGE_TYPE_PHYSICAL
     * CUSTOM_DAMAGE_MAGIC = DAMAGE_TYPE_MAGICAL
     * CUSTOM_DAMAGE_REMOVEHP = DAMAGE_TYPE_HP_REMOVAL 
     */
    private damageFilter = (keys: DamageFilterEvent) => {
        
        if (!keys.entindex_attacker_const || !keys.entindex_victim_const) {
            return false;
        }
        const attacker = EntIndexToHScript(keys.entindex_attacker_const) as CDOTA_BaseNPC;
        const victim = EntIndexToHScript(keys.entindex_victim_const) as CDOTA_BaseNPC;
       
        if (!attacker || attacker.IsNull() || !victim || victim.IsNull()) {
            return false;
        }
        
        const damageType = keys.damagetype_const;
        const inflictor = keys.entindex_inflictor_const;

        if (damageType === DAMAGE_TYPES.DAMAGE_TYPE_NONE) {
            return false;
        }
        
        let damageTable: Record<string, number>;
        let offensiveType = OffensiveTypeIdentifier.ATTACK;
        let isAbility = false;

        if (inflictor) {
            let ability = EntIndexToHScript(inflictor) as CDOTA_Ability_Lua;
            damageTable = this.onHandleSpellBetween(ability, victim);
            offensiveType = ability.CustomData.offensiveType;
            isAbility = true;
        } else {
            damageTable = this.handleAttackBetween(attacker, victim);
        }

        if( <any>damageType != CustomDamageTrigger.NO_TRIGGERS){
            if(isAbility){
                attacker.OnSpellDamageDealt(keys.damage, damageTable, victim, offensiveType) 
			    victim.OnSpellDamageTaken(keys.damage, damageTable, attacker, offensiveType)
            } else {
                attacker.OnAttackDamageDealt(keys.damage, damageTable, victim)
                victim.OnAttackDamageTaken(keys.damage, damageTable, attacker) 
            }
        }

        let damageResult = 0;
        let biggestValue = 0;
        let biggestKey = "";

        let currentValue;
        for (let key in damageTable) {
            currentValue = damageTable[key];
            if(currentValue > biggestValue){
                biggestValue = currentValue;
                biggestKey = key;
            }
            damageResult += currentValue;
        }

        // DeepPrintTable(damageTable);

        keys.damage = Math.ceil(damageResult);

        if(keys.damage === 0){
            showPopupDamageBlock(victim, 0);
        } else {
            showPopupNumbers(victim, "damage", DAMAGE_TYPE_BY_NAME[biggestKey].color, 2, keys.damage, undefined, Popup_Symbol_Post.DROP);
        }

        return true;
    }

    onHandleSpellBetween(npcAttackerSpell: CDOTA_Ability_Lua, npcVictim: CDOTA_BaseNPC) {
        const npcAttacker = <CDOTA_BaseNPC>npcAttackerSpell.GetOwner();
        const offensiveType = npcAttackerSpell.CustomData.offensiveType;

        const defenderCustomData = npcVictim.CustomData.getCurrentData();
        const defenseTable = this.getDamageTableDefensive(defenderCustomData);

        const attackerCustomData = npcAttacker.CustomData.getCurrentData();
        const attackerSpellCustomData = npcAttackerSpell.CustomData.getCurrentData();

        const abilityOffensiveTable = this.getDamageTableOffensive(attackerSpellCustomData, offensiveType);

        let attackerOffensiveTable = {};
        let globalTable = {};

        if (!npcAttackerSpell.CustomData.dummyDamage) {
            attackerOffensiveTable = this.getDamageTableOffensive(attackerCustomData, offensiveType);
            globalTable = this.getDamageTableOffensive(attackerCustomData, OffensiveTypeIdentifier.GLOBAL);
        }

        const spellDamageTable = this.calculateSpellDamageTable(abilityOffensiveTable, attackerOffensiveTable, globalTable, offensiveType, offensiveType);
        const damageResultTable: Record<string, number> = {};

        DAMAGE_TYPES_DATA.forEach(damageTypeData => damageTypeData.damageFunction(defenseTable, spellDamageTable, damageResultTable, offensiveType));

        return damageResultTable;
    }

    private calculateSpellDamageTable(abilityOffensiveTable: Record<string, number>, attackerOffensiveTable: Record<string, number>, globalTable: Record<string, number>, abilityOffensiveType: OffensiveTypeIdentifier, attackerOffensiveType: OffensiveTypeIdentifier) {
        const result: Record<string, number> = {};

        let abilityMin: number;
        let abilityMax: number;
        let attackerMin: number;
        let attackerMax: number;
        let globalMin: number;
        let globalMax: number;
        let spellMin: number;
        let spellMax: number;
        let flatSpellDamage: number;
        let flatGlobal: number;
        let percentAbility: number;
        let percentSpell: number;
        let percentGlobal: number;
        let flatCombined: number;

        for (let damageTypeData of DAMAGE_TYPES_DATA) {
            abilityMin = abilityOffensiveTable[damageTypeData[abilityOffensiveType].min] || 0;
            abilityMax = Math.max(abilityMin, abilityOffensiveTable[damageTypeData[abilityOffensiveType].max] || 0);

            attackerMin = attackerOffensiveTable[damageTypeData[attackerOffensiveType].min] || 0;
            attackerMax = Math.max(attackerMin, attackerOffensiveTable[damageTypeData[attackerOffensiveType].max] || 0);

            globalMin = globalTable[damageTypeData.global.min] || 0;
            globalMax = Math.max(globalMin, globalTable[damageTypeData.global.max] || 0);

            spellMin = Math.ceil(attackerMin + abilityMin);
            spellMax = Math.ceil(attackerMax + abilityMax);

            flatSpellDamage = RandomInt(spellMin, spellMax);
            flatGlobal = RandomInt(globalMin, globalMax);

            percentAbility = (abilityOffensiveTable[damageTypeData[abilityOffensiveType].percentage] || 0) / 100;
            percentSpell = (attackerOffensiveTable[damageTypeData[attackerOffensiveType].percentage] || 0) / 100;
            percentGlobal = (globalTable[damageTypeData.global.percentage] || 0) / 100;

            flatCombined = flatSpellDamage + flatGlobal;

            result[damageTypeData.name] = flatCombined + (flatCombined * percentAbility) + (flatCombined * percentSpell) + (flatCombined * percentGlobal);
        }

        return result;
    }

    handleAttackBetween(npcAttacker: CDOTA_BaseNPC, npcVictim: CDOTA_BaseNPC) {
        const defenderCustomData = npcVictim.CustomData.getCurrentData();
        const defenseTable = this.getDamageTableDefensive(defenderCustomData);

        const attackerCustomData = npcAttacker.CustomData.getCurrentData();
        
        const attackTable = this.getDamageTableOffensive(attackerCustomData, OffensiveTypeIdentifier.ATTACK);
        const globalTable = this.getDamageTableOffensive(attackerCustomData, OffensiveTypeIdentifier.GLOBAL);

        const attackDamageTable = this.calculateAttackDamageTable(attackTable, globalTable);

        const damageResultTable: Record<string, number> = {};

        DAMAGE_TYPES_DATA.forEach(damageTypeData => damageTypeData.damageFunction(defenseTable, attackDamageTable, damageResultTable, OffensiveTypeIdentifier.ATTACK));

        return damageResultTable;
    }

    private calculateAttackDamageTable(damageTable: Record<string, number>, globalTable: Record<string, any>) {
        const result: Record<string, number> = {};

        let damageMin: number;
        let damageMax: number;
        let globalMin: number;
        let globalMax: number;
        let flatDamage: number;
        let flatGlobal: number;
        let percentDamage: number;
        let percentGlobal: number;
        let flatCombined: number;

        for (let damageTypeData of DAMAGE_TYPES_DATA) {
            damageMin = damageTable[damageTypeData.attack.min] || 0;
            damageMax = Math.max(damageMin, damageTable[damageTypeData.attack.max] || 0);

            globalMin = globalTable[damageTypeData.global.min] || 0;
            globalMax = Math.max(globalMin, globalTable[damageTypeData.global.max] || 0);

            flatDamage = RandomInt(damageMin, damageMax);
            flatGlobal = RandomInt(globalMin, globalMax);

            percentDamage = (damageTable[damageTypeData.attack.percentage] || 0) / 100;
            percentGlobal = (damageTable[damageTypeData.global.percentage] || 0) / 100;

            flatCombined = flatDamage + flatGlobal;

            result[damageTypeData.name] = flatCombined + (flatCombined * percentDamage) + (flatCombined * percentGlobal);
        }

        return result;
    }

    private getDamageTableDefensive(customData: Record<string, number>) {
        const resultTable: Record<string, number> = {};
        let tempOffensiveTable;

        for (let damageTypeData of DAMAGE_TYPES_DATA) {
            tempOffensiveTable = damageTypeData.resistance;
            resultTable[tempOffensiveTable.flat] = customData[tempOffensiveTable.flat] || 0;
            resultTable[tempOffensiveTable.percentage] = customData[tempOffensiveTable.percentage] || 0;
        }

        return resultTable;
    }

    private getDamageTableOffensive(customData: Record<string, number>, offensiveType: OffensiveTypeIdentifier) {
        const resultTable: Record<string, number> = {};
        let tempOffensiveTable;

        for (let damageTypeData of DAMAGE_TYPES_DATA) {
            tempOffensiveTable = damageTypeData[offensiveType];
            resultTable[tempOffensiveTable.min] = customData[tempOffensiveTable.min] || 0;
            resultTable[tempOffensiveTable.max] = customData[tempOffensiveTable.max] || resultTable[tempOffensiveTable.min];
            resultTable[tempOffensiveTable.percentage] = customData[tempOffensiveTable.percentage] || 0;
        }

        return resultTable;
    }

    public static getOffensiveTable(customData: Record<string, number[]>, offensiveType: OffensiveTypeIdentifier){
        const resultTable: Record<string, number[]> = {};
        let tempOffensiveTable;

        for (let damageTypeData of DAMAGE_TYPES_DATA) {
            tempOffensiveTable = damageTypeData[offensiveType];
            
            const minValue = customData[tempOffensiveTable.min];
            if(minValue){
                resultTable[tempOffensiveTable.min] = minValue;
            }

            const maxValue = customData[tempOffensiveTable.max] || minValue;
            if(maxValue){
                resultTable[tempOffensiveTable.max] = maxValue;
            }
            
            const percentageValue = customData[tempOffensiveTable.percentage];
            if(percentageValue){
                resultTable[tempOffensiveTable.percentage] = percentageValue;
            }
        }

        return resultTable;
    }

    public static extractPrefixAsBase<T>(prefix: DAMAGE_TYPE_PREFIXES, customData: Record<string, T>){
        const resultTable: Record<string, T> = {};
        const prefixLength = string.len(prefix);

        let searchPrefix;
        let modifiedKey;

        for(let key in customData){
            searchPrefix = key.substr(0, prefixLength);
            if(prefix === searchPrefix){
                modifiedKey = key.substr(prefixLength, string.len(key));
                resultTable[modifiedKey] = customData[key];
            }
        }

        return resultTable;
    }

    static readonly DUMMY_ABILITY_DATA = {
        "AbilityBehavior":     			"DOTA_ABILITY_BEHAVIOR_PASSIVE",
		"BaseClass":           			"ability_datadriven",
		"AbilityTextureName":            "rubick_empty1",
		"MaxLevel":                      "1"
    }

    static DUMMY_ABILITY: CDOTA_Ability_Lua;

    public static ApplyCustomDamage(customData: CustomStats, victim: CDOTA_BaseNPC, inflictor: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier, damageType?: CustomDamageTrigger, dummyDamage?: boolean ){
        if(!damageType){
            damageType = CustomDamageTrigger.MAGIC
        }

        if(!CustomDamage.DUMMY_ABILITY){
            CustomDamage.DUMMY_ABILITY = SpawnEntityFromTableSynchronous("ability_datadriven", CustomDamage.DUMMY_ABILITY_DATA) as CDOTA_Ability_Lua;
        }
        const dummyAbility =  CustomDamage.DUMMY_ABILITY;
        if(!dummyAbility){
            print("Could not create dummy ability");
            return;
        }

        dummyAbility.CustomData = customData;
        customData.offensiveType = offensiveType || customData.offensiveType || OffensiveTypeIdentifier.SPELL;
        customData.dummyDamage = dummyDamage || customData.dummyDamage || false;
        dummyAbility.GetOwner = () => inflictor;

        ApplyDamage({
            victim: victim,
            attacker: inflictor,
            damage: 0,
            damage_type: <unknown>damageType as DAMAGE_TYPES,
            ability: dummyAbility
        });
    }

    // public static getNegatedDamageTableForLevel(customData: Record<string, number[]>)

    public static getNegatedDamageTableFor(customData: Record<string, number[]>, offensiveType: OffensiveTypeIdentifier){
        const result: Record<string, number[]> = {};

        let currentDamageTypeData: DamageTypeData;
        for(let i = 0; i < DAMAGE_TYPES_DATA.length; i++){
            currentDamageTypeData = DAMAGE_TYPES_DATA[i];

            for(let [key, value] of pairs(currentDamageTypeData[offensiveType])){
                if(customData[value]){
                    result[value] = customData[value].map(propertyValue => propertyValue * -1);
                }
            }
        }

        return result;
    }
}