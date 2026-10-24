export enum Popup_Symbol_Pre {
    PLUS = 0,
    MINUS = 1,
    SADFACE = 2,
    BROKENARROW = 3,
    SHADES = 4,
    MISS = 5,
    EVADE = 6,
    DENY = 7,
    ARROW = 8
}

export enum Popup_Symbol_Post {
    EXCLAMATION = 0,
    POINTZERO = 1,
    MEDAL = 2,
    DROP = 3,
    LIGHTNING = 4,
    SKULL = 5,
    EYE = 6,
    SHIELD = 7,
    POINTFIVE = 8
}

export function showPopupNumbers(target: CBaseEntity, particleEffect: string, color: Vector, lifetime: number, value?: number, presymbol?: Popup_Symbol_Pre, postsymbol?: Popup_Symbol_Post) {
    const particlePath = string.format("particles/msg_fx/msg_%s.vpcf", particleEffect);
    const particleId = ParticleManager.CreateParticle(particlePath, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, target);

    let digits = 0;
    if(value){
        digits = tostring(value).length
    }
    if(presymbol){
        digits++;
    }
    if(postsymbol){
        digits++;
    }

    ParticleManager.SetParticleControl(particleId, 1, Vector(tonumber(presymbol), tonumber(value), tonumber(postsymbol)));
    ParticleManager.SetParticleControl(particleId, 2, Vector(lifetime, digits, 0));
    ParticleManager.SetParticleControl(particleId, 3, color);
}

// e.g. when healed by an ability
export function showPopupHealing(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "heal", Vector(0, 255, 0), 1.0, amount, Popup_Symbol_Pre.PLUS);
}
// e.g. the popup you get when you suddenly take a large portion of your health pool in damage at once
export function showPopupDamage(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "damage", Vector(255, 0, 0), 1.0, amount, undefined, Popup_Symbol_Post.DROP);
}

// e.g. when dealing critical damage
export function showPopupCriticalDamage(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "crit", Vector(255, 0, 0), 1.0, amount, undefined, Popup_Symbol_Post.LIGHTNING);
}

// e.g. when taking damage over time from a poison type spell
export function showPopupDamageOverTime(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "poison", Vector(215, 50, 248), 1.0, amount, undefined, Popup_Symbol_Post.EYE);
}

// e.g. when blocking damage with a stout shield
export function showPopupDamageBlock(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "block", Vector(255, 255, 255), 1.0, amount, Popup_Symbol_Pre.MINUS);
}

// e.g. when last-hitting a creep
export function showPopupGoldGain(target: CBaseEntity, amount: number){
    showPopupNumbers(target, "gold", Vector(255, 200, 33), 1.0, amount, Popup_Symbol_Pre.PLUS);
}
    
// e.g. when missing uphill
export function showPopupMiss(target: CBaseEntity){
    showPopupNumbers(target, "miss", Vector(255, 0, 0), 1.0, undefined, Popup_Symbol_Pre.MISS);
}
