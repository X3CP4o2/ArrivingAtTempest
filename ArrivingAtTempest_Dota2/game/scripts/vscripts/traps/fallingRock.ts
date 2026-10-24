import { registerEntityFunction, BaseAbility } from '../lib/dota_ts_adapter';

declare const thisEntity: CBaseEntity;

registerEntityFunction("OnStartTouch", (trigger: HammerTriggerEvent) => {
    print("OnStartTouch", trigger.caller.GetName());
    GameRules.Addon.hammerEventObservers.nofityListeners("OnTriggerTrap", trigger);

    print(thisEntity.GetName());
    print(trigger.caller.GetName());
    print(trigger.activator.GetName());
    print(thisEntity.GetSpawnGroupHandle());

    CreateUnitByNameAsync("cast_dummy", thisEntity.GetAbsOrigin(), false, undefined, undefined, DOTATeam_t.DOTA_TEAM_NEUTRALS, (unit: CDOTA_BaseNPC) => {
        print("Created unit: ", unit.GetUnitName(), unit.GetAbsOrigin());

        unit.AddAbility("trap_falling_rock");
        const ability = unit.FindAbilityByName("trap_falling_rock");
        ability!.SetLevel(1);
        Timers.CreateTimer(1, () => {
            unit.CastAbilityOnPosition(unit.GetAbsOrigin(), ability!, 0);
        });
        
    });
});