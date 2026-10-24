import { BaseModifier } from '../lib/dota_ts_adapter';
import type { CustomAbility } from './CustomAbility';
import { UnitEventHookName } from '../shared/enums';

export class CustomModifier extends BaseModifier{
    
    params!: Record<string, number>;

    OnCreated(params: Record<string, number>){
        this.params = params;
        this.OnModifierCreated();
    }

    OnDestroy(){
        this.OnModifierDestroyed();
    }

    OnRefresh(params: Record<string, number>){
        this.OnDestroy();
        this.OnCreated(params);
    }

    OnModifierCreated(){
        (<CustomAbility>this.GetAbility()).OnModifierApplied(this);

        this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaModifierRecieved, this);

        if(this.IsDebuff()){
            this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaDebuffRecieved, this);
        } else if(this.IsBuff()){
            this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaBuffRecieved, this);
        }  
    }

    OnModifierDestroyed(){
        (<CustomAbility>this.GetAbility()).OnModifierExpired(this);

        this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaModifierRecievedExpired, this);

        if(this.IsDebuff()){
            this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaDebuffRecievedExpired, this);
        } else if(this.IsBuff()){
            this.GetParent().Observers.nofityListeners(UnitEventHookName.OnDotaBuffRecievedExpired, this);
        }  
    }

    IsAura(){
        return false;
    }

    IsDebuff(){
        return false;
    }

    IsHexDebuff(){
        return false;
    }

    IsPurgable(){
        return false;
    }

    IsStunDebuff(){
        return false;
    }

    IsPurgeException(){
        return false;
    }

    IsPermanent(){
        return false;
    }

    IsHidden(){
        return false;
    }

    IsBuff(){
        return false;
    }
}