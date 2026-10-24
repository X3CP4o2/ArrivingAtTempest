import { CustomModifier } from '../../customstats/CustomModifier';
import { registerModifier } from '../../lib/dota_ts_adapter';
import { PropertyNames } from '../../enums/stats';
import { UnitEventHookName } from '../../enums/enums';

@registerModifier("sleep_modifier")
export class SleepModifier extends CustomModifier{
    
    onDamageTakenIndex!: number | undefined;

    OnCreated(params: Record<string, number>){
        if(IsClient()){
            return;
        }
        super.OnCreated(params);

        print("Created LostSirenSleepModifier");
        DeepPrintTable(params);
        print(this.GetParent().GetUnitName());


        this.onDamageTakenIndex = this.GetParent().Observers.addListener(UnitEventHookName.OnDamageTaken, () => {
            this.onDamageTakenIndex = undefined;
            this.Destroy();
            return true;
        });

        this.SetDuration(params[PropertyNames.DURATION], true);
    }

    OnDestroy(){
        if(IsClient()){
            return;
        }
        super.OnDestroy();

        if(this.onDamageTakenIndex){
            this.GetParent().Observers.removeListener(UnitEventHookName.OnDamageTaken, this.onDamageTakenIndex);
        }
    }

    CheckState(){
        return {
            [ModifierState.STUNNED]: true,
        }
    }


    GetEffectAttachType(){
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    GetEffectName(){
        return "particles/generic_gameplay/generic_sleep.vpcf"
    }
    
}