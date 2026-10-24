import { BaseModifier, registerModifier } from '../lib/dota_ts_adapter';

@registerModifier()
export class modifier_hidehpbar extends BaseModifier{

    OnCreated(){

    }

    CheckState(){
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
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