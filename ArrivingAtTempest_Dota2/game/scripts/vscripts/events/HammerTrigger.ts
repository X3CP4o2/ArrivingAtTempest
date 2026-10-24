import { registerEntityFunction } from "../lib/dota_ts_adapter";


registerEntityFunction("OnStartTouch", (trigger: HammerTriggerEvent) => {
    print("OnStartTouch", trigger.caller.GetName());
    GameRules.Addon.hammerEventObservers.nofityListeners("OnStartTouch", trigger);
});

registerEntityFunction("OnTouching", (trigger: HammerTriggerEvent) => {
    print("OnTouching", trigger.caller.GetName());
    GameRules.Addon.hammerEventObservers.nofityListeners("OnTouching", trigger);
});

registerEntityFunction("OnEndTouch", (trigger: HammerTriggerEvent) => {
    print("OnEndTouch", trigger.caller.GetName());
    GameRules.Addon.hammerEventObservers.nofityListeners("OnEndTouch", trigger);
});
