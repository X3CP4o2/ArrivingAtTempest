import { BaseItem } from '../../lib/dota_ts_adapter';

export abstract class AChest extends BaseItem {

    position!: Vector;
    angles!: Vector;
    kv!: Record<string, string>;
    channelingPlaceholder!: CBaseAnimating;

    Spawn() {
        if (IsServer()) {
            this.kv = this.GetAbilityKeyValues() as Record<string, string>;
            this.HandleSkinAndScale();
        }
    }

    private HandleSkinAndScale() {
        const kvSkin = this.GetSkin();
        const kvScale = this.GetScale();

        if (kvSkin == 0 && kvScale == 1) {
            return;
        }
        // Container is not created by engine at Spawn() time
        Timers.CreateTimer(0.01, () => {
            const container = this.GetContainer();

            if (container) {
                container.SetSkin(kvSkin);
                container.SetModelScale(kvScale);
            }
        });
    }

    // For some reason, it doesnt apply the item texture, so we find it here
    GetAbilityTextureName() {
        return GetAbilityTextureNameForAbility(this.GetName());
    }

    // OnSpellStart gets called twice for some reason, thats why we check if position and placeholder are set
    OnSpellStart() {
        if (IsClient()) {
            return;
        }

        if (!this.position) {
            this.position = this.GetContainer()!.GetOrigin();
            this.angles = this.GetContainer()!.GetAnglesAsVector();
        }

        if (!this.channelingPlaceholder) {
            this.channelingPlaceholder = this.SpawnReplacementChests(this.GetChestModel());
            this.EmitSound(this.GetStartChestSound());
        }
    }

    OnChannelFinish(interrupted: boolean) {
        if (IsClient()) {
            return;
        }
        if (interrupted) {
            this.RedropChest();
            this.DeleteChest();
            return;
        }
        this.OnChestOpen();
    }

    OnChestOpen() {
        print("Opened chest");
        this.EmitSound(this.GetSuccessChestSound());
        this.CreateLoot();
        const chest = this.SpawnReplacementChests(this.GetChestOpenModel());
        this.SpawnFinishChestEffect(chest);

        this.DeleteChest();
    }

    private SpawnFinishChestEffect(chest: CBaseAnimating) {
        const effectPath = this.GetFinishChestEffect();
        const particle = ParticleManager.CreateParticle(effectPath, ParticleAttachment.CUSTOMORIGIN, undefined);
        const origin = chest.GetAbsOrigin().__add(Vector(0, 0, 40));
        ParticleManager.SetParticleControl(particle, 0, origin);

        Timers.CreateTimer(2, () => {
            ParticleManager.DestroyParticle(particle, false);
            ParticleManager.ReleaseParticleIndex(particle);
        });

    }

    private SpawnReplacementChests(model: string): CBaseAnimating {

        const item = SpawnEntityFromTableSynchronous("prop_dynamic", {
            model: model,
            scale: this.GetScale(),
            origin: this.position,
            angles: this.angles,
            skin: this.GetSkin()
        }) as CBaseAnimating;

        item.ResetSequence("chest_treasure_idle");

        return item as CBaseAnimating;
    }

    private RedropChest() {
        const chestReplace = CreateItem(this.GetName(), undefined, undefined);
        const item = CreateItemOnPositionSync(this.position, chestReplace);
        item.SetAngles(this.angles.x, this.angles.y, this.angles.z);
        item.SetModelScale(this.GetScale());
        item.ResetSequence("chest_treasure_idle");
        item.EmitSound(this.GetFailChestSound());
    }

    private DeletePlaceholder() {
        this.channelingPlaceholder.RemoveSelf();
    }

    private DeleteChest() {
        // Removing an item also destroys the underlying entity, be carefull
        this.GetCaster().RemoveItem(this);
        this.DeletePlaceholder();
    }

    private CreateLoot() {
        const caster = this.GetCaster();

        const item = CreateItem("item_weapon_test_1h", caster.GetPlayerOwner(), undefined);
        const worldItem = CreateItemOnPositionSync(this.position, item);
        item?.LaunchLoot(false, RandomInt(150, 250), RandomFloat(0.5, 1.2), caster.GetOrigin().__add(RandomVector(RandomInt(100, 200))));
    }

    private GetChestOpenModel() {
        return this.kv["ReplaceOnOpen"];
    }

    private GetChestModel() {
        return this.kv["Model"];
    }

    private GetSkin() {
        return tonumber(this.kv["Skin"]) || 0;
    }

    protected GetScale() {
        return tonumber(this.kv["Scale"]) || 1;
    }

    protected GetFinishChestEffect() {
        return this.kv["FinishChestEffect"];
    }

    protected GetStartChestSound(){
        return this.kv["StartChestSound"];
    }

    protected GetFailChestSound(){
        return this.kv["FailChestSound"];
    }

    protected GetSuccessChestSound(){
        return this.kv["SuccessChestSound"];
    }
}