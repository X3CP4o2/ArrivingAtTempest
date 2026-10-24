import { registerEntityFunction } from '../lib/dota_ts_adapter';

declare const thisEntity: CBaseEntity;

registerEntityFunction("OnStartTouch", (trigger: HammerTriggerEvent) => {
    print("OnStartTouch", trigger.caller.GetName());
    GameRules.Addon.hammerEventObservers.nofityListeners("OnTriggerTrap", trigger);

    print(thisEntity.GetName());
    print(trigger.caller.GetName());
    print(trigger.activator.GetName());
    print(thisEntity.GetSpawnGroupHandle());

    CreateUnitByNameAsync("unit_cavern_lostsiren", thisEntity.GetAbsOrigin(), false, undefined, undefined, DOTATeam_t.DOTA_TEAM_NEUTRALS, (unit: CDOTA_BaseNPC) => {
        print("Created unit: ", unit.GetUnitName(), unit.GetAbsOrigin());
        unit.SetAggroTarget(trigger.activator);
    });
});