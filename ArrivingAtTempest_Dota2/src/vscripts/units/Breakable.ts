import { registerUnitScript } from "../lib/dota_ts_adapter";
import { CustomNPCScript } from "./CustomNPCScript";

@registerUnitScript()
class Breakable extends CustomNPCScript{

    Spawn(entity: CDOTA_BaseNPC){
        super.Spawn(entity);
    }

    onDamageTaken() {
        super.onDamageTaken();

        this.createParticle(this.GetOnDamageTakenEffect());
        return false;
    }

    onDeath() {
        super.onDeath();

        this.createParticle(this.GetOnDeathEffect());
        this.spawnReplacement(this.GetOnDeathModel());

        this.dropLoot();

        this.entity.RemoveSelf();
        return true;
    }

    private createParticle(name: string){
        const particleId = ParticleManager.CreateParticle(name, ParticleAttachment.CUSTOMORIGIN, undefined);
        ParticleManager.SetParticleControl(particleId, 0, this.entity.GetAbsOrigin().__add(Vector(0, this.entity.GetBoundingMaxs().y, 0)));
        Timers.CreateTimer(1, () => {
            ParticleManager.DestroyParticle(particleId, false);
            ParticleManager.ReleaseParticleIndex(particleId);
        })
    }

    private spawnReplacement(model: string): CBaseAnimating {

        const replacement = SpawnEntityFromTableSynchronous("prop_dynamic", {
            model: model,
            scale: this.entity.GetModelScale(),
            origin: this.entity.GetOrigin(),
            angles: this.entity.GetAngles(),
            skin: this.GetSkin()
        }) as CBaseAnimating;

        replacement.ResetSequence("chest_treasure_idle");

        return replacement as CBaseAnimating;
    }

    private dropLoot(){
        // TODO
    }

    GetOnDeathModel(){
        return tostring(this.kv["OnDeathModel"]);
    }
}