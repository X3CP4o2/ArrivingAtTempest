import { registerAbility } from '../../lib/dota_ts_adapter';
import { AbilityMechanicParams, MechanicParams, CustomAbility } from '../../customstats/CustomAbility';
import { AbilityMechanicHookName } from '../../shared/enums';
import { PropertyNames, AbilityPropertyNames } from '../../shared/stats';
import { ProjectileData } from '../../projectile/CustomProjectileManager';
import { RotateVector2D, ToRadians } from '../../utils/utils';
import { SleepModifier } from '../../modifiers/abilities/modifier_sleep';

@registerAbility("lost_siren_sleep")
export class LostSirenSleep extends CustomAbility {

    constructor(){
        super({

        });

        this.AddMechanic(AbilityMechanicHookName.OnSpellStart, {
            func: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: MechanicParams) => {
               abilityParams.targets.forEach((target) => {
                    // Create ?and register? cast effect

                    // Unterscheiden zwischen CastEnd und EffectEnd
                    const duration = ability.customStats.getForCurrentLevel(PropertyNames.DURATION);
                    ability.ApplyDotaModifier(mechanicParams.appliesModifier![0], target, {
                        [PropertyNames.DURATION]: duration || 0,
                    });
               });
            },
            params: {
                baseMechanic: true,
                usesStats: [
                    PropertyNames.DURATION
                ],
                appliesModifier: [
                    SleepModifier.name
                ],
                abilityData: {

                }
            }
        });
/* 
        this.AddMechanic(AbilityMechanicHookName.OnProjectileStart, {
            func: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => {
                projectileData.abilityMetaInfo.processId = ability.RegisterProcess();
            }
        });

        this.AddMechanic(AbilityMechanicHookName.OnProjectileFinish, {
            func: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => {
                ability.FinishProcess(projectileData.abilityMetaInfo.processId);
            }
        });


        this.AddMechanic(AbilityMechanicHookName.OnSpellStart, {
            func: () => this.SpawnProjectile()
        });

        this.AddMechanic(AbilityMechanicHookName.OnProjectileProgress, {
            func: (ability: CustomAbility, abilityParams: AbilityMechanicParams, mechanicParams: any, projectileData: ProjectileData) => {
                projectileData.direction = RotateVector2D(projectileData.direction, ToRadians(math.sin(Time() * 5) * 12));
                projectileData.speed = 200;

                this.GetCaster().SetAbsOrigin(projectileData.position);
            }
        }); */
    }

    Spawn(){
        super.Spawn();

        if(IsClient()){
            return;
        }
        
        this.customStats.addModifiers({
            [PropertyNames.RADIUS]: 300,
            [PropertyNames.CASTRANGE]: 1000,
            [PropertyNames.COOLDOWN_FLAT]: 0,
            [PropertyNames.MANACOST_FLAT]: 10,
            [PropertyNames.MANACOST_PERCENT]: 10,
            [AbilityPropertyNames.ABILITY_BEHAVIOR]: DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_AOE | DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT,
            [AbilityPropertyNames.ABILITY_TARGET_FLAGS]: DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
            [AbilityPropertyNames.ABILITY_TARGET_TEAM]: DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_BOTH,
            [AbilityPropertyNames.ABILITY_TARGET_TYPE]: DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_ALL,
            [AbilityPropertyNames.ABILITY_TARGET_ORDER]: FindOrder.FIND_ANY_ORDER,
            [PropertyNames.TARGET_COUNT]: 1,
            [PropertyNames.DURATION]: 5
        });
    }
} 