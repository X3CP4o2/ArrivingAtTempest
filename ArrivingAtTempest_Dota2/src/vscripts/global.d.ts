import { OffensiveTypeIdentifier } from './customstats/CustomDamage';
import { CustomStats } from './customstats/CustomStats';
import { Observers } from './lib/Observers';
import { AbilityMechanicHookName, UnitEventHookName } from './enums/enums';

declare global {

    type NPCObserverType = AbilityMechanicHookName | UnitEventHookName;

    interface CDOTA_BaseNPC{
        CustomData: CustomStats;
        Observers: Observers<NPCObserverType>;

        OnDamageDealt: (totalDamage: number, damageTable: Record<string, any>, victim: CDOTA_BaseNPC) => void;
        OnAttackDamageDealt: (totalDamage: number, damageTable: Record<string, any>, victim: CDOTA_BaseNPC) => void;
        OnSpellDamageDealt: (totalDamage: number, damageTable: Record<string, any>, victim: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => void;
        
        OnDamageTaken: (totalDamage: number, damageTable: Record<string, any>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => void;
        OnAttackDamageTaken: (totalDamage: number, damageTable: Record<string, any>, attacker: CDOTA_BaseNPC) => void;
        OnSpellDamageTaken: (totalDamage: number, damageTable: Record<string, any>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => void;

        OnBeforeDeath: (excessDamage: number, totalDamage: number, damageTable: Record<string, any>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => void;

        OnDeath: (attacker: CDOTA_BaseNPC) => void;
        OnKill: (victim: CDOTA_BaseNPC) => void;
    }

    interface CDOTA_Ability_Lua{
        CustomData: CustomStats;
    }

    interface HammerTriggerEvent {
        outputid: number;
        activator: CDOTA_BaseNPC;
        caller: CBaseEntity;
    }

    interface CDOTA_BaseNPC_Hero {
        hiddenWearables: CBaseEntity[];
    }
}
