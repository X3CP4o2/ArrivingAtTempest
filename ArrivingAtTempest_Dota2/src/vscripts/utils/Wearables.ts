
const ATTACHMENT_TABLE = {
    HEIGHT: 200
}

export function HideWearables(unit: CDOTA_BaseNPC_Hero) {
    unit.hiddenWearables = [];

    let model = unit.FirstMoveChild();
    while (model != null) {
        if (model.GetClassname() === "dota_item_wearable") {
            model.AddEffects(EntityEffects.EF_NODRAW);
            model.Destroy();
            unit.hiddenWearables.push(model);
        }
        model = model.NextMovePeer();
    }
}

export function ChangeWearableInSlot(unit: CDOTA_BaseNPC_Hero, slotName: string, modelName: string) {
    const id = unit.ScriptLookupAttachment(slotName);

    CreateUnitByNameAsync("wearable_dummy", unit.GetAttachmentOrigin(id), false, undefined, undefined, unit.GetTeam(), (model) => {
        model.SetOriginalModel(modelName);
        model.SetModel(modelName);

        model.AddNewModifier(undefined, undefined, "modifier_cosmetics", {});

        model.SetOwner(unit);
        model.SetForwardVector(unit.GetAttachmentForward(id));

        model.SetAbsOrigin(unit.GetAttachmentOrigin(id).__sub(Vector(0, 0, ATTACHMENT_TABLE.HEIGHT)));

        const angles = unit.GetAttachmentAngles(id);
        model.SetAngles(angles.x, angles.y, angles.z);

        model.SetParent(unit, slotName);

        // model.SetOrigin(model.GetOrigin().__add(Vector(0, 125)));
        // model.FollowEntity(unit, true);


    });
}