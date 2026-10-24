import { BaseModifier, registerModifier } from '../lib/dota_ts_adapter';

@registerModifier()
export class modifier_cosmetics extends BaseModifier{

    OnCreated(){

    }

    // Add Invisible later
    CheckState(){
        return {
            [modifierstate.MODIFIER_STATE_STUNNED]: true,
            [modifierstate.MODIFIER_STATE_NO_HEALTH_BAR]: true,
            [modifierstate.MODIFIER_STATE_NO_UNIT_COLLISION]: true,
            [modifierstate.MODIFIER_STATE_NOT_ON_MINIMAP]: true,
            [modifierstate.MODIFIER_STATE_INVULNERABLE]: true,
            [modifierstate.MODIFIER_STATE_UNSELECTABLE]: true,
            [modifierstate.MODIFIER_STATE_PROVIDES_VISION]: false,
            [modifierstate.MODIFIER_STATE_UNTARGETABLE]: true,
        }
    }

    IsHidden(){
        return true;
    }

    IsPurgable(){
        return false;
    }

    IsPurgeException(){
        return false;
    }

    IsStunDebuff(){
        return false;
    }

    
}