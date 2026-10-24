import { BaseItem, registerAbility } from '../lib/dota_ts_adapter';
import { CustomStats } from './CustomStats';
import { AbilityMechanic } from './CustomAbility';
import {AbilityMechanicHookName} from '../shared/enums';

export enum InventorySlot {
    Head = "Head",
    Neck = "Neck",
    Body = "Body",
    Hands = "Hands",
    Mainhand = "Mainhand",
    Offhand = "Offhand",
    Gloves = "Gloves",
    Boots = "Boots",
    Belt = "Belt",
    Ring = "Ring"
}

export enum SpellSlot {
    Spell = "Spell",
    SpellStat = "SpellStat",
    SpellMod = "SpellMod"
}

export type ItemSlot = InventorySlot | SpellSlot;

export enum ItemCategory {
    Equipment = "Equipment",
    Consumeable = "Consumeable",
    Spell = "Spell",
    Currency = "Currency",
    Material = "Material",
    Quest= "Quest",
}

export enum ItemType {
    Weapon = "Weapon",
    Armor = "Armor",
    Jewelry = "Jewelry",
    Potion = "Potion",
}

export enum ItemClass {
    Sword,
    Axe,
    Staff,
    Bow,
    Arrow,
    Shield,
    Dagger,
    Helmet,
    Gloves,
    Boots,
    Ring,
    Amulet,
    Gold,
}

export enum WeaponTypes {
    OneHand,
    TwoHands
}

type ItemInfo  = {
    [key in ItemClass]?: {
        category: ItemCategory;
        type: ItemType;
        weaponTypes: WeaponTypes[];
        slots: InventorySlot[];
    }
}

export const ItemInfo: ItemInfo = {
    [ItemClass.Sword]: {
        category: ItemCategory.Equipment,
        type: ItemType.Weapon,
        weaponTypes: [WeaponTypes.OneHand, WeaponTypes.TwoHands],
        slots: [InventorySlot.Mainhand, InventorySlot.Offhand]
    }
}


export interface ItemTableData {
    blocksSlots: InventorySlot[];
}

@registerAbility("item_weapon_test_1h")
export class CustomItem extends BaseItem {
    static ITEM_COUNT = 0;

    customStats!: CustomStats;
    entityIndexString!: string;

    mechanics: Record<AbilityMechanicHookName, AbilityMechanic<AbilityMechanicHookName>[]> = {} as any;

    uniqueId!: string;

    Spawn() {
        this.entityIndexString = this.entityIndexString || tostring(this.GetEntityIndex());
        if (IsServer()) {
            this.uniqueId = GameRules.Addon.remoteData.GetUniqueGameId() + (++CustomItem.ITEM_COUNT);
            this.customStats = this.customStats || new CustomStats(this);
            print("Spawn item item_weapon_test_1h");
        }

    }

    GetBehavior() {
        return DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_PASSIVE;
    }
}