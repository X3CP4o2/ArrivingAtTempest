import { BaseModifier, registerModifier } from '../lib/dota_ts_adapter';
import { CustomStats } from '../customstats/CustomStats';
import { DAMAGE_TYPE_PREFIXES, PropertyNames } from '../shared/stats';
import { CustomDamage, CustomDamageTrigger, OffensiveTypeIdentifier, DAMAGE_TYPE_BY_NAME } from '../customstats/CustomDamage';
import { Observers } from '../lib/Observers';
import { UnitEventHookName } from '../shared/enums';

const lifeleechEffect = "particles/generic_gameplay/generic_lifesteal.vpcf";
const manaleechEffect = "particles/generic_gameplay/generic_lifesteal_blue.vpcf";

function calculateProperty(flat: number, percent: number){
    const factor = 1 + percent / 100;
    return flat * factor;
}

@registerModifier()
export class modifier_stats extends BaseModifier{

    customData!: CustomStats;
    observers!: Observers<NPCObserverType>;

    OnCreated(): void {
        if(IsServer()){
            const owner = this.GetParent();
            const modifier = this;
            this.customData = owner.CustomData;
            this.observers = owner.Observers;
            
            owner.OnDamageDealt = (totalDamage: number, damageTable: Record<string, number>, victim: CDOTA_BaseNPC) => {
                const [modifiedDamage] = owner.Observers.nofityListeners(UnitEventHookName.OnDamageDealt, totalDamage, damageTable, victim);
                
                modifier.LifeleechToOwner(modifiedDamage);
                modifier.ManaleechToOwner(modifiedDamage);
            }

            owner.OnAttackDamageDealt = (totalDamage: number, damageTable: Record<string, number>, victim: CDOTA_BaseNPC) => {
                const [modifiedDamage, modifiedDamageTable] = owner.Observers.nofityListeners(UnitEventHookName.OnAttackDamageDealt, totalDamage, damageTable, victim);
                
                modifier.AttackLifeleech(modifiedDamage);
                modifier.AttackManaleech(modifiedDamage);

                owner.OnDamageDealt(modifiedDamage, modifiedDamageTable, victim);
            }

            owner.OnSpellDamageDealt = (totalDamage: number, damageTable: Record<string, number>, victim: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => {
                const [modifiedDamage, modifiedDamageTable] = owner.Observers.nofityListeners(UnitEventHookName.OnSpellDamageDealt, totalDamage, damageTable, victim, offensiveType);
                
                if(offensiveType === OffensiveTypeIdentifier.ATTACK){
                    owner.OnAttackDamageDealt(modifiedDamage, modifiedDamageTable, victim);
                    return;
                }
                

                modifier.SpellLifeleech(modifiedDamage);
                modifier.SpellManaleech(modifiedDamage);

                owner.OnDamageDealt(modifiedDamage, modifiedDamageTable, victim);
            }

            owner.OnDamageTaken = (totalDamage: number, damageTable: Record<string, number>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => {
                // print("On Damage Taken");
                const [modifiedDamage, modifiedDamageTable] = owner.Observers.nofityListeners(UnitEventHookName.OnDamageTaken, totalDamage, damageTable, attacker, offensiveType);
                
                const resultHealth = owner.GetHealth() - modifiedDamage;

                if(resultHealth <= 0){
                    owner.OnBeforeDeath(Math.abs(resultHealth), modifiedDamage, modifiedDamageTable, attacker, offensiveType);
                }
            }

            owner.OnAttackDamageTaken = (totalDamage: number, damageTable: Record<string, number>, attacker: CDOTA_BaseNPC) => {
                const [modifiedDamage, modifiedDamageTable] = owner.Observers.nofityListeners(UnitEventHookName.OnAttackDamageTaken, totalDamage, damageTable, attacker);

                modifier.DoRetaliation(attacker, OffensiveTypeIdentifier.ATTACK);
                owner.OnDamageTaken(modifiedDamage, modifiedDamageTable, attacker, OffensiveTypeIdentifier.ATTACK);
                modifier.DoReflect(modifiedDamage, modifiedDamageTable, attacker, OffensiveTypeIdentifier.ATTACK);
            }

            owner.OnSpellDamageTaken = (totalDamage: number, damageTable: Record<string, number>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => {
                const [modifiedDamage, modifiedDamageTable] = owner.Observers.nofityListeners(UnitEventHookName.OnSpellDamageTaken, totalDamage, damageTable, attacker, offensiveType);

                if(offensiveType === OffensiveTypeIdentifier.ATTACK){
                    owner.OnAttackDamageTaken(modifiedDamage, modifiedDamageTable, attacker);
                    return;
                }

                modifier.DoRetaliation(attacker, OffensiveTypeIdentifier.SPELL);
                owner.OnDamageTaken(modifiedDamage, modifiedDamageTable, attacker, OffensiveTypeIdentifier.SPELL);
                modifier.DoReflect(modifiedDamage, modifiedDamageTable, attacker, OffensiveTypeIdentifier.SPELL);
            }

            owner.OnBeforeDeath = (excessDamage: number, totalDamage: number, damageTable: Record<string, number>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier) => {
                owner.Observers.nofityListeners(UnitEventHookName.OnBeforeDeath, excessDamage, totalDamage, damageTable, attacker, offensiveType);
            }

            owner.OnDeath = (attacker: CDOTA_BaseNPC) => {
                owner.Observers.nofityListeners(UnitEventHookName.OnDeath, attacker);
            }

            owner.OnKill = (victim: CDOTA_BaseNPC) => {
                owner.Observers.nofityListeners(UnitEventHookName.OnKill, victim);
            }
        }
    }

    DoReflect(totalDamage: number, damageTable: Record<string, number>, attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier){
        if(totalDamage <= 0){
            return;
        }

        const reflectorCustomData = this.customData.getData();
        const reflectExtractData = CustomDamage.extractPrefixAsBase(DAMAGE_TYPE_PREFIXES.Reflect, reflectorCustomData);
        const allReflectValue = reflectorCustomData[PropertyNames.REFLECT_DAMAGE_PER] ? reflectorCustomData[PropertyNames.REFLECT_DAMAGE_PER][this.customData.level] || 0 : 0;

        if(!next(reflectExtractData) && !allReflectValue){
            return;
        }

        let noDamage = true;
        let minDamageTable: Record<string, number> = {};

        let currentDamageTypeData;

        for(let [damageName, value] of pairs(damageTable)){
            if(value <= 0){
                continue;
            }
            currentDamageTypeData = DAMAGE_TYPE_BY_NAME[damageName];
            const reflectDamageTypeValuesPer = reflectExtractData[damageName + "DamagePer"] ? reflectExtractData[damageName + "DamagePer"][0] || 0 : 0;
            const calculatedValue = (reflectDamageTypeValuesPer + allReflectValue) / 100 * value;

            if(calculatedValue <= 0){
                continue;
            }

            noDamage = false;
            minDamageTable[currentDamageTypeData[offensiveType].min] = calculatedValue;
            minDamageTable[currentDamageTypeData[offensiveType].max] = calculatedValue;
        }

        if(noDamage){
            return;
        }

        // Maybe needs a tweak sometime
        const [modifiedTable] = this.GetParent().Observers.nofityListeners(UnitEventHookName.OnReflect, minDamageTable, attacker, offensiveType);

        const dummyData = CustomStats.createBasicDummyData({}, this.GetParent(), undefined, true);
        dummyData.addModifiers(modifiedTable as Record<string, number>);

        CustomDamage.ApplyCustomDamage(dummyData, attacker, this.GetParent(), offensiveType, CustomDamageTrigger.NO_TRIGGERS);
    }


    DoRetaliation(attacker: CDOTA_BaseNPC, offensiveType: OffensiveTypeIdentifier){
        const retaliatorCustomData = this.customData.getData();
        const retaliatorExtractData = CustomDamage.extractPrefixAsBase(DAMAGE_TYPE_PREFIXES.Retaliation, retaliatorCustomData);

        if(!next(retaliatorExtractData)){
            return;
        }

        const retaliationTable = CustomDamage.getOffensiveTable(retaliatorExtractData, offensiveType);
        let noDamage = true;

        for( let [_, value] of pairs(retaliationTable)){
            if(value[this.customData.level] > 0){
                noDamage = false;
                break;
            }
        }

        if(noDamage){
            return;
        }

        const [modifiedTable] = this.GetParent().Observers.nofityListeners(UnitEventHookName.OnRetaliation, retaliationTable, attacker, offensiveType);

        const dummyData = CustomStats.createBasicDummyData(modifiedTable, this.GetParent(), undefined, true);

        CustomDamage.ApplyCustomDamage(dummyData, attacker, this.GetParent(), offensiveType, CustomDamageTrigger.NO_TRIGGERS);
        
        // Retaliation effect & sound
    }

    private calculateFor(flatPropertyName: string, percentagePropertyName: string) {
        const propertyFlat = this.customData.getForCurrentLevel(flatPropertyName) || 0;
        const propertyPercent = this.customData.getForCurrentLevel(percentagePropertyName) || 0;
        return calculateProperty(propertyFlat, propertyPercent);
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            modifierfunction.MODIFIER_PROPERTY_ATTACKSPEED_BASE_OVERRIDE,
            modifierfunction.MODIFIER_PROPERTY_HEALTH_BONUS,
            modifierfunction.MODIFIER_PROPERTY_EXTRA_HEALTH_BONUS,
            modifierfunction.MODIFIER_PROPERTY_HEALTH_REGEN_CONSTANT,
            modifierfunction.MODIFIER_PROPERTY_MANA_BONUS,
            modifierfunction.MODIFIER_PROPERTY_MANA_REGEN_CONSTANT,
            modifierfunction.MODIFIER_PROPERTY_MOVESPEED_ABSOLUTE,
            modifierfunction.MODIFIER_EVENT_ON_ATTACK_LANDED
        ];
    }

    CheckState(){
        return {
            [modifierstate.MODIFIER_STATE_NO_HEALTH_BAR]: true
        }
    }

    // Minion only
    GetModifierExtraHealthBonus(){
        if(this.GetParent().IsHero()){
            return 0;
        }
        return this.calculateFor(PropertyNames.HEALTH_FLAT, PropertyNames.HEALTH_PERCENT);
    }

    // Hero only
    GetModifierHealthBonus(){
        if(!this.GetParent().IsHero()){
            return 0;
        }
        return this.calculateFor(PropertyNames.HEALTH_FLAT, PropertyNames.HEALTH_PERCENT);
    }

    GetModifierManaBonus(){
        return this.calculateFor(PropertyNames.MANA_FLAT, PropertyNames.MANA_PERCENT);
    }

    GetModifierMoveSpeed_Absolute(){
        if(IsClient()){
            return 0;
        }
        return this.calculateFor(PropertyNames.MOVESPEED_FLAT, PropertyNames.MOVESPEED_PERCENT);
    }

    GetModifierAttackSpeedBaseOverride(){
        if(IsClient()){
            return 0;
        }
        return this.calculateFor(PropertyNames.ATTACKSPEED_FLAT, PropertyNames.ATTACKSPEED_PERCENT);
    }

    GetModifierConstantHealthRegen(){
        if(IsClient()){
            return 0;
        }

        return this.calculateFor(PropertyNames.HEALTH_REGEN_FLAT, PropertyNames.HEALTH_REGEN_PERCENT);
    }

    GetModifierConstantManaRegen(){
        if(IsClient()){
            return 0;
        }

        return this.calculateFor(PropertyNames.MANA_REGEN_FLAT, PropertyNames.MANA_REGEN_PERCENT);
    }

    OnAttackLanded(event: ModifierAttackEvent){
        if(IsClient()){
            return;
        }
        if( <number>event.damage_type !== CustomDamageTrigger.NO_TRIGGERS && this.GetParent() == event.attacker){
            this.LifeGainOnHit();
            this.ManaGainOnHit();
        }
    }

    LifeGainOnHit(){
        const value = this.customData.getForCurrentLevel(PropertyNames.HEALTH_GAIN_ON_HIT);
        if(!value){
            return;
        }

        this.GetParent().Heal(value, <any>this.GetParent());
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(lifeleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, this.GetParent()));
    }

    ManaGainOnHit(){
        const value = this.customData.getForCurrentLevel(PropertyNames.MANA_GAIN_ON_HIT);
        if(!value){
            return;
        }

        this.GetParent().GiveMana(value);
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(manaleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, this.GetParent()));
    }

    
    Liefeleech(totalDamage: number, offensiveValue: number, globalProperty: number){
        const lifeleech = offensiveValue + globalProperty;
        if(lifeleech === 0){
            return;
        }

        const leechValue = totalDamage * (lifeleech / 100);

        this.GetParent().Heal(leechValue, <any>this.GetParent());
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(lifeleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, this.GetParent()))
    }
    AttackLifeleech(totalDamage: number){
        this.Liefeleech(
            totalDamage,
            this.customData.getForCurrentLevel(PropertyNames.LIFELEECH_ATTACK) || 0,
            this.customData.getForCurrentLevel(PropertyNames.LIFELEECH_GLOBAL) || 0
        );
    }
    SpellLifeleech(totalDamage: number){
        this.Liefeleech(
            totalDamage,
            this.customData.getForCurrentLevel(PropertyNames.LIFELEECH_SPELL) || 0,
            this.customData.getForCurrentLevel(PropertyNames.LIFELEECH_GLOBAL) || 0
        );
    }
    LifeleechToOwner(totalDamage: number){
        const owner = this.GetParent().GetOwner() as CDOTA_BaseNPC;
        if(!owner){
            return;
        }

        const lifeleech = totalDamage * (this.customData.getForCurrentLevel(PropertyNames.LIFELEECH_TO_OWNER) || 0 / 100);
        if(lifeleech === 0){
            return;
        }

        owner.Heal(lifeleech, <any>this.GetParent());
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(lifeleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, owner));
    }

    Manaleech(totalDamage: number, offensiveValue: number, globalProperty: number){
        const manaleech = offensiveValue + globalProperty;
        if(manaleech === 0){
            return;
        }

        const leechValue = totalDamage * (manaleech / 100);

        this.GetParent().GiveMana(leechValue);
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(manaleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, this.GetParent()))
    }
    AttackManaleech(totalDamage: number){
        this.Manaleech(
            totalDamage,
            this.customData.getForCurrentLevel(PropertyNames.MANALEECH_ATTACK) || 0,
            this.customData.getForCurrentLevel(PropertyNames.MANALEECH_GLOBAL) || 0,
        );
    }
    SpellManaleech(totalDamage: number){
        this.Manaleech(
            totalDamage,
            this.customData.getForCurrentLevel(PropertyNames.MANALEECH_SPELL) || 0,
            this.customData.getForCurrentLevel(PropertyNames.MANALEECH_GLOBAL) || 0,
        );
    }
    ManaleechToOwner(totalDamage: number){
        const owner = this.GetParent().GetOwner() as CDOTA_BaseNPC;
        if(!owner){
            return;
        }

        const manaleech = totalDamage * (this.customData.getForCurrentLevel(PropertyNames.MANALEECH_TO_OWNER) || 0 / 100);
        if(manaleech === 0){
            return;
        }

        owner.GiveMana(manaleech);
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(manaleechEffect, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, owner));
    }

    IsHidden(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }

    IsPurgeException(): boolean {
        return false;
    }

    RemoveOnDeath(): boolean {
        return false;
    }
}