import { registerEntityFunction } from '../lib/dota_ts_adapter';

interface Teleporter extends CBaseTrigger{
    preventTeleportMap: Record<number, boolean>;
    targetTeleporters: Teleporter[];
}

declare const thisEntity: Teleporter;
thisEntity.preventTeleportMap = {};
thisEntity.targetTeleporters = [];

registerEntityFunction("Spawn", () => {
    const thisEntitySplitName = thisEntity.GetName().split("_");
    const thisIdentifier = thisEntitySplitName[1];

    print("Spawn: ", thisEntity.GetName(), thisIdentifier);

    for(let otherEntity of Entities.FindAllByClassname("trigger_dota")){
        if(otherEntity === thisEntity){
            continue;
        }

        const otherEntitySplitName = otherEntity.GetName().split("_");
        const otherEntityLength = otherEntitySplitName.length;

        print("Found other ", otherEntity.GetName(), otherEntityLength);

        if( otherEntitySplitName[0] !== "teleporter" || otherEntityLength <= 1){
            continue;
        }

        const otherIdentifier = otherEntitySplitName[1];
        print("Processing other teleporter ", otherIdentifier);

        for(let i = 2; i < otherEntityLength; i++){
            if(otherEntitySplitName[i] === thisIdentifier){
                print("Added ", thisIdentifier, " to ", otherIdentifier);
                (<Teleporter>otherEntity).targetTeleporters.push(thisEntity);
            }
        }

        for(let j = 2; j < thisEntitySplitName.length; j++){
            if(thisEntitySplitName[j] === otherIdentifier){
                print("Included ", otherIdentifier, " to ", thisIdentifier);
                thisEntity.targetTeleporters.push(otherEntity as Teleporter);
            }
        }
    }

    thisEntity.SetEntityName("teleporter");
    thisEntity.RedirectOutput("OnStartTouch", "OnStartTouch", thisEntity);
    thisEntity.RedirectOutput("OnEndTouch", "OnEndTouch", thisEntity);
});

registerEntityFunction("OnStartTouch", (trigger: HammerTriggerEvent) => {
    print("OnStartTouch caller: ", trigger.caller.GetEntityIndex(), "thisEntity: ", thisEntity.GetEntityIndex(), "activator: ", trigger.activator);
    GameRules.Addon.hammerEventObservers.nofityListeners("OnStartTouch", trigger);
    const activatorIndex = trigger.activator.GetEntityIndex();
    if(thisEntity.preventTeleportMap[activatorIndex]){
        return;
    }
    const teleporterCount = RandomInt(1, thisEntity.targetTeleporters.length);
    const targetTeleporter = thisEntity.targetTeleporters[teleporterCount - 1];
    targetTeleporter.preventTeleportMap[activatorIndex] = true;
    thisEntity.preventTeleportMap[activatorIndex] = true;
    trigger.activator.SetAbsOrigin(targetTeleporter.GetAbsOrigin());
    (<CDOTA_BaseNPC>trigger.activator).Stop();

    GameRules.Addon.hammerEventObservers.nofityListeners("OnTeleported", {
        targetTeleporter: targetTeleporter,
        sourceTeleporter: thisEntity,
        unit: trigger.activator
    });
});

registerEntityFunction("OnEndTouch", (trigger: HammerTriggerEvent) => {
    print("OnEndTouch caller: ", trigger.caller.GetEntityIndex(), "thisEntity: ", thisEntity.GetEntityIndex(), "activator: ", trigger.activator);
    GameRules.Addon.hammerEventObservers.nofityListeners("OnEndTouch", trigger);

    thisEntity.preventTeleportMap[trigger.activator.GetEntityIndex()] = false;
});
