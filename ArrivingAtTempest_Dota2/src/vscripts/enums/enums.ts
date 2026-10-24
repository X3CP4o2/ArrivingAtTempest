export enum CustomGameTableName {
    CUSTOM_STATS = "customstats"
}

export enum CustomNetTableName {
    clientAbilityLUA = "clientAbilityLUA"
}

export enum AbilityMechanicHookName{
    OnSpellStart = "OnSpellStart",
    OnChannelStart = "OnChannelStart",
    OnChannelProgress = "OnChannelProgress",
    OnChannelAbort = "OnChannelAbort",
    OnChannelSuccess = "OnChannelSuccess",
    OnChannelFinish = "OnChannelFinish",
    OnSpellCasted = "OnSpelLCasted",
    OnSpellEffectFinish = "OnSpellEffectFinish",
    OnProjectileStart = "OnProjectileStart",
    OnProjectileProgress = "OnProjectileProgress",
    OnProjectileHit = "OnProjectileHit",
    OnProjectileFinish = "OnProjectileFinish",
    OnUpgrade = "OnUpgrade",
    OnDamageDealt = "OnDamageDealt",
    OnAccquireTargets = "OnAccquireTargets",
    OnDotaModifierApplied = "OnDotaModifierApplied",
    OnDotaModifierExpired = "OnDotaModifierExpired",
    OnDotaBuffApplied = "OnDotaBuffApplied",
    OnDotaBuffExpired = "OnDotaBuffExpired",
    OnDotaDebuffApplied = "OnDotaDebuffApplied",
    OnDotaDebuffExpired = "OnDotaDebuffExpired",
}

export enum UnitEventHookName{
    OnDotaModifierRecieved = "OnDotaModifierRecieved",
    OnDotaModifierRecievedExpired = "OnDotaModifierRecievedExpired",
    OnDotaDebuffRecieved = "OnDotaDebuffRecieved",
    OnDotaDebuffRecievedExpired = "OnDotaDebuffRecievedExpired",
    OnDotaBuffRecieved = "OnDotaBuffRecieved",
    OnDotaBuffRecievedExpired = "OnDotaBuffRecievedExpired",
    OnRetaliation = "OnRetaliation",
    OnReflect = "OnReflect",
    OnDamageDealt = "OnDamageDealt",
    OnAttackDamageDealt = "OnAttackDamageDealt",
    OnSpellDamageDealt = "OnSpellDamageDealt",
    OnDamageTaken = "OnDamageTaken",
    OnAttackDamageTaken = "OnAttackDamageTaken",
    OnSpellDamageTaken = "OnSpellDamageTaken",
    OnBeforeDeath = "OnBeforeDeath",
    OnDeath = "OnDeath",
    OnKill = "OnKill",
}