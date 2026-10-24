import { BaseModifier, registerModifier } from '../lib/dota_ts_adapter';

@registerModifier()
export class modifier_cosmetics extends BaseModifier{

    OnCreated(){

    }

    // Add Invisible later
    CheckState(){
        return {
            [ModifierState.STUNNED]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.PROVIDES_VISION]: false,
            [ModifierState.UNTARGETABLE]: true,
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