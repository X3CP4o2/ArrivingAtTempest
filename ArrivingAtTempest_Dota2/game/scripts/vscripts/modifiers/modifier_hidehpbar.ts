import { BaseModifier, registerModifier } from '../lib/dota_ts_adapter';

@registerModifier()
export class modifier_hidehpbar extends BaseModifier{

    OnCreated(){

    }

    CheckState(){
        return {
            [modifierstate.MODIFIER_STATE_NO_HEALTH_BAR]: true,
            [modifierstate.MODIFIER_STATE_NOT_ON_MINIMAP]: true,
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