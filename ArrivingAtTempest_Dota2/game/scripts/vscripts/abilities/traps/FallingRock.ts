import { registerAbility, BaseAbility } from '../../lib/dota_ts_adapter';


const modelPath = "maps/cavern_assets/models/stalagmites/stalactite_cavern_01.vmdl";

@registerAbility("trap_falling_rock")
class FallingRock extends BaseAbility{

    Spawn(){
        if(IsServer()){
            print("Spawn FallingRock");
        }
    }

    OnSpellStart(){
        print("Cast FallingRock");

        const position = this.GetCursorPosition();
        print(position);
        const offset = Vector(0, 0, 2000);

        const startPosition = position.__add(offset);
        const interval = 0.05;
        let remainingTime = 1.2;

        const travelSpeed = 2000 / 1.2 * interval * 2;

        // Replace with ParticleSystem
        const rockEntity = SpawnEntityFromTableSynchronous("prop_dynamic", {
            model: modelPath,
            origin: startPosition,
            scale: 2
        });

        Timers.CreateTimer(() => {
            remainingTime -= interval;
            if(remainingTime > 0){
                rockEntity.SetOrigin(rockEntity.GetOrigin().__add(Vector(0, 0, -travelSpeed)));            
                return interval;
            }

            rockEntity.RemoveSelf();
            print("Deal damage");
        });
    }

    GetAbilityTargetType(){
        return DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_ALL;
    }

    GetAbilityType(){
        return ABILITY_TYPES.ABILITY_TYPE_BASIC;
    }

    GetAbilityTargetFlags(){
        return DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE;
    }

    GetBehavior(){
        return DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_AOE | DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT;
    }

    GetCastRange(){
        return 9999999;
    }

    GetCooldown(){
        return 0;
    }

    GetAOERadius(){
        return 100;
    }

    GetManaCost(){
        return 0;
    }

    
}