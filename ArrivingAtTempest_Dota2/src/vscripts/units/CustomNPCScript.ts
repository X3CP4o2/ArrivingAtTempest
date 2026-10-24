import { CustomStats } from "../customstats/CustomStats";
import { registerUnitScript } from "../lib/dota_ts_adapter";
import { Observers } from "../lib/Observers";
import { modifier_hidehpbar } from "../modifiers/modifier_hidehpbar";
import { UnitEventHookName } from '../enums/enums';

enum SoundEventKey {
    Spawn = "Spawn",
    Hurt = "Hurt",
    Death = "Death"
}

interface ParticleDef{
    "effect": string,
    "controlpoint": number,
    "particleAttach": number,
    "attachment": string,
	"offsetX": number,
	"offsetY": number
	"offsetZ": number
}

@registerUnitScript()
export class CustomNPCScript {

    kv!: Record<string, string | any>;
    entity!: CDOTA_BaseNPC;

    Spawn(entity: CDOTA_BaseNPC){
        this.kv = GameRules.Addon.unitTable[entity.GetUnitName()];
        this.entity = entity;

        entity.Observers = entity.Observers || new Observers();
        entity.CustomData = entity.CustomData || new CustomStats(entity, true, false);


        this.entity.AddNewModifier(undefined, undefined, modifier_hidehpbar.name, {});
        this.entity.Observers.addListener(UnitEventHookName.OnDamageTaken, () => this.onDamageTaken());
        this.entity.Observers.addListener(UnitEventHookName.OnDeath, () => this.onDeath());

        Timers.CreateTimer(0.1, () => this.HandleParticles());

        this.PlaySound(SoundEventKey.Spawn);
    }

    protected HandleParticles(){
        const particleTable = this.GetParticlesDef();
        if(!particleTable){
            return;
        }

        for(let [_, values] of pairs(particleTable)){
            this.AttachParticle(values["effect"], values["controlpoint"], values["particleAttach"], values["attachment"], Vector(values["offsetX"], values["offsetY"], values["offsetZ"]));
        }
    }

    private AttachParticle(name: string, controlpoint: number, particleAttach: ParticleAttachment_t, attachment: string, offset: Vector){
        const particle = ParticleManager.CreateParticle(name, particleAttach, this.entity);
        ParticleManager.SetParticleControlEnt(particle, controlpoint, this.entity, particleAttach, attachment, offset, false);
    }

    protected PlaySound(soundEvent: SoundEventKey){
        this.entity.EmitSound(this.GetSoundSet() + "." + soundEvent);
    }

    protected onDamageTaken(){
        this.PlaySound(SoundEventKey.Hurt);
        return false;
    }

    protected onDeath(){
        this.PlaySound(SoundEventKey.Death);
        return true;
    }

    protected GetSkin() {
        return this.kv["Skin"];
    }

    protected GetSoundSet(){
        return this.kv["SoundSet"];
    }

    protected GetOnDamageTakenEffect(){
        return tostring(this.kv["OnDamageTakenEffect"]);
    }

    protected GetOnDeathEffect(){
        return tostring(this.kv["OnDeathEffect"]);
    }

    protected GetParticlesDef(){
        return this.kv["Particles"];
    }
}