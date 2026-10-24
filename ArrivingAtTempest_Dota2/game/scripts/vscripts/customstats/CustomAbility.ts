import { BaseAbility } from '../lib/dota_ts_adapter';
import { PropertyNames } from '../shared/stats';
import { CustomStats } from './CustomStats';
import { CustomNetTableName } from '../shared/enums';
import { AbilityPropertyNames } from '../shared/stats';
import { CustomProjectileManager, ProjectileDeathType, ProjectileType, ProjectileData } from '../projectile/CustomProjectileManager';
import { AbilityMechanicHookName } from '../shared/enums';
import { CopyArrayShallow, RotateVector2D, ToRadians } from '../utils/utils';
import { CustomModifier } from './CustomModifier';

export interface AbilityTableData {
    [AbilityPropertyNames.ABILITY_BEHAVIOR]: DOTA_ABILITY_BEHAVIOR,
    [AbilityPropertyNames.ABILITY_TARGET_FLAGS]: DOTA_UNIT_TARGET_FLAGS,
    [AbilityPropertyNames.ABILITY_TARGET_TEAM]: DOTA_UNIT_TARGET_TEAM,
    [AbilityPropertyNames.ABILITY_TARGET_TYPE]: DOTA_UNIT_TARGET_TYPE,
}

type AbilityMechanicFunctions = {
    [AbilityMechanicHookName.OnSpellStart]: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, extraParams: any) => void;
    [AbilityMechanicHookName.OnChannelStart]: () => void;
    [AbilityMechanicHookName.OnChannelProgress]: () => void;
    [AbilityMechanicHookName.OnChannelAbort]: () => void;
    [AbilityMechanicHookName.OnChannelSuccess]: () => void;
    [AbilityMechanicHookName.OnChannelFinish]: () => void;
    [AbilityMechanicHookName.OnSpellEffectFinish]: () => void;
    [AbilityMechanicHookName.OnProjectileStart]: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => void;
    [AbilityMechanicHookName.OnProjectileProgress]: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => void;
    [AbilityMechanicHookName.OnProjectileHit]: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => void;
    [AbilityMechanicHookName.OnProjectileFinish]: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => void;
    [AbilityMechanicHookName.OnUpgrade]: () => void;
    [AbilityMechanicHookName.OnDamageDealt]: () => void;
    [AbilityMechanicHookName.OnSpellCasted]: () => void;
    [AbilityMechanicHookName.OnAccquireTargets]: () => void;
    [AbilityMechanicHookName.OnDotaModifierApplied]: () => void;
    [AbilityMechanicHookName.OnDotaModifierExpired]: () => void;
    [AbilityMechanicHookName.OnDotaBuffApplied]: () => void;
    [AbilityMechanicHookName.OnDotaBuffExpired]: () => void;
    [AbilityMechanicHookName.OnDotaDebuffApplied]: () => void;
    [AbilityMechanicHookName.OnDotaDebuffExpired]: () => void;
}

export interface MechanicParams {
    baseMechanic: boolean,
    appliesModifier?: string[],
    usesStats?: (PropertyNames | AbilityPropertyNames)[],
    declaresOwnStats?: Record<string, number[]>
    addsCategories?: string[],
    abilityData?: Partial<AbilityData>,
    abilityIndex?: number;
    identifier?: string;
}

export interface AbilityMechanic<T extends AbilityMechanicHookName> {
    func: AbilityMechanicFunctions[T];
    params?: MechanicParams;
}

export interface AbilityData {

}

export interface AbilityMechanicParams {
    targets: CDOTA_BaseNPC[];
    sharedMechanicData?: any;
}

export class CustomAbility extends BaseAbility {
    customStats!: CustomStats;
    entityIndexString!: string;

    private mechanics: Record<AbilityMechanicHookName, AbilityMechanic<AbilityMechanicHookName>[]> = {} as Record<AbilityMechanicHookName, AbilityMechanic<AbilityMechanicHookName>[]>;
    openMechanicProcesses: boolean[] = [];


    private unmodifiedTargets!: CDOTA_BaseNPC[] | undefined;
    private abilityTargets!: CDOTA_BaseNPC[];
    private lastAbilityTargets!: CDOTA_BaseNPC[];

    constructor(public readonly abilityData: AbilityData) {
        super();
    }

    AddMechanic<T extends AbilityMechanicHookName>(hook: T, mechanic: AbilityMechanic<T>) {
        if (!this.mechanics[hook]) {
            this.mechanics[hook] = [];
        }

        // TODO: Add stats, network ability mechanics, do something with abilitydata?
        table.insert(this.mechanics[hook], mechanic);
        mechanic.params = mechanic.params || {} as MechanicParams;
        mechanic.params.abilityIndex = table.maxn(this.mechanics[hook]);
        return mechanic.params.abilityIndex;
    }

    RemoveMechanic<T extends AbilityMechanicHookName>(hook: T, index: number){
        return table.remove(this.mechanics[hook], index);
    }

    Spawn() {
        this.entityIndexString = tostring(this.GetEntityIndex());
        if (IsServer()) {
            this.customStats = new CustomStats(this);
            this.decorateCustomStatsRefresh();
        }
    }

    GenerateAbilityMechanicParams(): AbilityMechanicParams {
        return {
            targets: this.abilityTargets.slice(0, this.getPropertyServer(PropertyNames.TARGET_COUNT)),
        }
    }

    ApplyDotaModifier(name: string, target: CDOTA_BaseNPC, data: Record<string, number>){
        target.AddNewModifier(this.GetCaster(), this, name, data);
    }

    /**
     * Finds targets according to ability behavior. Uses FindTargetUnits if aoe
     */
    FindTargets() {
        let result: CDOTA_BaseNPC[] | undefined;
        const abilityBehavior = this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_BEHAVIOR);
        if (!abilityBehavior) {
            print("Could not get AbilityBehavior for current level");
            return;
        }
        if (this.HasBehavior(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET)) {
            const target = this.GetCursorTarget();
            if (!target) {
                print("Single target ability could not get CursorTarget");
                return;
            }
            result = [target];
        } else if (this.HasBehavior(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_AOE)) {
            result = this.FindTargetUnits(this.GetCaster().GetTeam());
        }
        return result;
    }

    /**
     * Finds units in radius around location with ability configuration flags
     * @param casterTeam 
     * @param location 
     */
    FindTargetUnitsAtLocation(casterTeam: DOTATeam_t, location: Vector) {
        const targetTeam = this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_TEAM) || DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_ENEMY;
        const targetFlags = this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_FLAGS) || DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE;
        const targetType = this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_TYPE) || DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_BASIC;
        const targetOrder = this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_ORDER) || FindOrder.FIND_ANY_ORDER;

        print("FindTargetUnitsAtLocation: ", targetTeam, targetFlags, targetType, targetOrder);

        return FindUnitsInRadius(casterTeam, location, undefined, this.GetAOERadius(), targetTeam, targetType, targetFlags, targetOrder, false);
    }

    /**
     * Calls FindTargetUnitsAtLocation with the appropiate location for this ability configuration
     * @param casterTeam 
     */
    FindTargetUnits(casterTeam: DOTATeam_t) {
        let location;
        if (this.HasBehavior(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT)) {
            location = this.GetCursorPosition();
        } else {
            location = this.GetCaster().GetAbsOrigin();
        }
        print("FindTargetUnits: ", casterTeam, location);
        return this.FindTargetUnitsAtLocation(casterTeam, location);
    }

    OnUpgrade() {
        this.customStats.level = this.GetLevel();
        this.customStats.refreshCombinedStats();

        this.HandleMechanicByName(AbilityMechanicHookName.OnUpgrade);
    }

    protected CallMechanic<T extends AbilityMechanicHookName>(mechanic: AbilityMechanic<T>, extraParams = {}) {
        mechanic.func(this, this.GenerateAbilityMechanicParams(), mechanic.params, extraParams as any);
    }

    protected NotifyCaster(mechanicName: AbilityMechanicHookName, extraParams = {}) {
        this.GetCaster().Observers.nofityListeners(mechanicName, this, extraParams);
    }

    HandleMechanicByName(mechanicName: AbilityMechanicHookName, extraParams = {}, notifyCaster = true) {
        if (notifyCaster) {
            this.NotifyCaster(mechanicName, extraParams);
        }

        const mechanics = this.mechanics[mechanicName];
        if (!mechanics) {
            return;
        }

        let currentMechanic;
        for (let i = 0; i < mechanics.length; i++) {
            currentMechanic = mechanics[i];
            this.CallMechanic(currentMechanic, extraParams);
        }
    }

    private HandleSpellStart() {
        this.HandleMechanicByName(AbilityMechanicHookName.OnSpellStart);
        if (!this.IsChanneling()) {
            this.HandleMechanicByName(AbilityMechanicHookName.OnSpellCasted);
        }
    }

    HasBehavior(behavior: DOTA_ABILITY_BEHAVIOR) {
        return (this.GetBehaviorInt() & behavior) == behavior;
    }

    private HandleChannelStart() {
        if (this.IsChanneling()) {
            this.HandleMechanicByName(AbilityMechanicHookName.OnChannelStart);
        }
    }

    TryFinishAbility() {
        if (this.IsAbilityFinished()) {
            this.OnSpellEffectFinish();
        }
    }

    IsAbilityFinished() {
        for (let open of this.openMechanicProcesses) {
            if (!open) {
                return;
            }
        }
        return true;
    }

    /**
     * async task finished, call spellfinish if last one
     * @param index 
     */
    FinishProcess(index: number) {
        this.openMechanicProcesses[index] = true;
        this.TryFinishAbility();
    }

    /**
     * Used to tell the spell that it got a async task and isnt finished
     */
    RegisterProcess() {
        for (let i = 0; i < this.openMechanicProcesses.length; i++) {
            if (this.openMechanicProcesses[i]) {
                continue;
            }
            this.openMechanicProcesses[i] = true;
            return i + 1;
        }
        this.openMechanicProcesses.push(true);
        return this.openMechanicProcesses.length;
    }

    OnSpellStart() {
        print("OnSpellStart");
        this.AcquireTargets();
        this.HandleSpellStart();
        this.HandleChannelStart();
    }

    AcquireTargets() {
        this.lastAbilityTargets = this.abilityTargets || [];
        this.unmodifiedTargets = this.FindTargets() || [];
        this.abilityTargets = CopyArrayShallow(this.unmodifiedTargets);

        this.HandleMechanicByName(AbilityMechanicHookName.OnAccquireTargets, {
            unmodifiedTargets: CopyArrayShallow(this.unmodifiedTargets),
            abilityTargets: this.abilityTargets,
            lastAbilityTargets: this.lastAbilityTargets
        });
    }

    OnChannelFinish(interrupted: boolean) {
        if (interrupted) {
            this.HandleMechanicByName(AbilityMechanicHookName.OnChannelAbort);
        } else {
            this.HandleMechanicByName(AbilityMechanicHookName.OnChannelSuccess);
            this.HandleMechanicByName(AbilityMechanicHookName.OnSpellCasted);
        }
        this.HandleMechanicByName(AbilityMechanicHookName.OnChannelFinish);
    }

    OnChannelThink(interval: number) {
        this.HandleMechanicByName(AbilityMechanicHookName.OnChannelProgress, { interval: interval });
    }

    OnSpellEffectFinish() {
        print("OnSpellEffectFinish");
        this.HandleMechanicByName(AbilityMechanicHookName.OnSpellEffectFinish);
    }

    SpawnProjectile() {
        print("SpawnProjectile");
        CustomProjectileManager.CreateProjectile({
            ability: this,
            effectPath: "",
            source: this.GetCaster(),
            origin: this.GetCaster().GetAbsOrigin().__add(Vector(0, 0, 100)),
            direction: this.GetCaster().GetForwardVector(),
            visionTeam: this.GetCaster().GetTeam(),
            speed: 200,
            type: ProjectileType.LINEAR,
            deathTypes: {
                [ProjectileDeathType.DISTANCE]: 1000
            },
            startRadius: 50
        });
    }

    OnProjectileHitHandle(target: CDOTA_BaseNPC | undefined, location: Vector, projectileHandle: ProjectileID) {
        if (target) {
            return CustomProjectileManager.ProjectileHit(projectileHandle, target, location);
        }
        return CustomProjectileManager.ProjectileEnded(projectileHandle, location);
    }

    OnProjectileThinkHandle(projectileHandle: ProjectileID) {
        CustomProjectileManager.ProjectileUpdate(projectileHandle);
    }

    OnModifierApplied(modifier: CustomModifier){
        this.HandleMechanicByName(AbilityMechanicHookName.OnDotaModifierApplied, modifier);
        if(modifier.IsDebuff()){
            this.HandleMechanicByName(AbilityMechanicHookName.OnDotaBuffApplied, modifier);
        } else if(modifier.IsBuff()){
            this.HandleMechanicByName(AbilityMechanicHookName.OnDotaBuffApplied, modifier);
        }
    }

    OnModifierExpired(modifier: CustomModifier){
        this.HandleMechanicByName(AbilityMechanicHookName.OnDotaModifierExpired, modifier);
        if(modifier.IsDebuff()){
            this.HandleMechanicByName(AbilityMechanicHookName.OnDotaBuffExpired, modifier);
        } else if(modifier.IsBuff()){
            this.HandleMechanicByName(AbilityMechanicHookName.OnDotaBuffExpired, modifier);
        }
    }


    private decorateCustomStatsRefresh() {
        const oldCalculateCombinedStats = this.customStats.calculateCombinedStats;

        this.customStats.calculateCombinedStats = () => {
            oldCalculateCombinedStats();

            CustomNetTables.SetTableValue(CustomNetTableName.clientAbilityLUA, this.entityIndexString, {
                [PropertyNames.RADIUS]: this.customStats.getForCurrentLevel(PropertyNames.RADIUS),
                [PropertyNames.CASTRANGE]: this.customStats.getForCurrentLevel(PropertyNames.CASTRANGE),
                [PropertyNames.COOLDOWN_FLAT]: this.customStats.getForCurrentLevel(PropertyNames.COOLDOWN_FLAT),
                [PropertyNames.COOLDOWN_PERCENT]: this.customStats.getForCurrentLevel(PropertyNames.COOLDOWN_PERCENT),
                [PropertyNames.MANACOST_FLAT]: this.customStats.getForCurrentLevel(PropertyNames.MANACOST_FLAT),
                [PropertyNames.MANACOST_PERCENT]: this.customStats.getForCurrentLevel(PropertyNames.MANACOST_PERCENT),
                [AbilityPropertyNames.ABILITY_BEHAVIOR]: this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_BEHAVIOR),
                [AbilityPropertyNames.ABILITY_TARGET_FLAGS]: this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_FLAGS),
                [AbilityPropertyNames.ABILITY_TARGET_TEAM]: this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_TEAM),
                [AbilityPropertyNames.ABILITY_TARGET_TYPE]: this.customStats.getForCurrentLevel(AbilityPropertyNames.ABILITY_TARGET_TYPE)
            });
        };
    }

    protected getPropertyClient(propertyFlat: string, propertyPercent: string) {
        const table = CustomNetTables.GetTableValue(CustomNetTableName.clientAbilityLUA, this.entityIndexString);
        if (!table) {
            return 0;
        }

        const flat = table[propertyFlat] || 0;
        const per = table[propertyPercent] || 0;

        return flat * (1 + per / 100);
    }

    protected getPropertyServer(propertyFlat: string, propertyPercent?: string) {
        const flat = this.customStats.getForCurrentLevel(propertyFlat) || 0;
        const per = propertyPercent ? (this.customStats.getForCurrentLevel(propertyPercent) || 0) : 0;
        return flat * (1 + per / 100);
    }

    protected getProperty(propertyFlat: string, propertyPercent = "") {
        if (IsServer()) {
            return this.getPropertyServer(propertyFlat, propertyPercent);
        } else {
            return this.getPropertyClient(propertyFlat, propertyPercent);
        }
    }

    GetAbilityTargetType() {
        return this.getProperty(AbilityPropertyNames.ABILITY_TARGET_TYPE) || DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_BASIC;
    }

    GetAbilityTargetTeam() {
        return this.getProperty(AbilityPropertyNames.ABILITY_TARGET_TEAM) || DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_ENEMY;
    }

    GetAbilityType() {
        return ABILITY_TYPES.ABILITY_TYPE_BASIC;
    }

    GetAbilityTargetFlags() {
        return this.getProperty(AbilityPropertyNames.ABILITY_TARGET_FLAGS) || DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE;
    }

    GetBehavior() {
        return this.getProperty(AbilityPropertyNames.ABILITY_BEHAVIOR);
    }

    //----- Client property
    GetAOERadius() {
        return this.getProperty(PropertyNames.RADIUS);
    }
    //----- /Client property

    //----- Mixed properties
    GetCastRange() {
        return this.getProperty(PropertyNames.CASTRANGE);
    }

    GetCooldown() {
        return this.getProperty(PropertyNames.COOLDOWN_FLAT, PropertyNames.COOLDOWN_PERCENT);
    }

    GetManaCost() {
        return this.getProperty(PropertyNames.MANACOST_FLAT, PropertyNames.MANACOST_PERCENT);
    }
    //----- /Mixed properties
}