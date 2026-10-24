interface CustomUIConfig {
 /*    AbilityTooltip: CustomAbilityTooltip;
    AbilityList: CustomAbilityList;
    HeroStatTooltip: HeroStatTooltip; */
    HerobarInventory: HerobarInventory;
    ItemTooltip: CustomItemTooltip;
    HeroXPBar: XPBar;
    HeroHealthBar: HealthBar;
    HeroManaBar: ManaBar;
    TargetInfo: TargetInfo;
     /*
    AbilityUpgradeTooltip: CustomAbilityUpgradeTooltip;
    CustomShop: CustomShop; */
}
interface CustomNetTableDeclarations {
    customdata1: any;
    customdata2: any;
    customdata3: any;
    customdata4: any;
    customperks: any;
    chosenperks: any;
    functiondata: any;
    dummyunitdata: any;
    mechanicsdata: NettableStructure<MechanicsData>;
    wavesdata: any;
    customshops: any;
    dummyitems: any;
}

interface NettableStructure<T> {
    [key: number]: T | {}
}

type MechanicTypes = "Summon" | "Modifier"
type MechanicTrigger = "OnSpellStart" | "OnHit" | "OnSummon"
type MechanicTriggerObject = {[key: string]: Mechanic}

type Mechanic = {
    "Unique": boolean;
    "Copyable": boolean;
    "Name": string;
    "Params": {[key: string]: any};
    "Mechanic": string;
    "Type": MechanicTypes;
}

interface MechanicsData {
    ["OnSpellStart"]?: MechanicTriggerObject
    ["OnHit"]?: MechanicTriggerObject
    ["OnSummon"]?: MechanicTriggerObject
}

interface Panel {
    ClearPanelEvent(arg: PanelEvent): void;
    SetDraggable(arg: boolean): void;
}

interface InventorySlotPanel extends Panel {
    Refresh(): void;
    Activate(): void;
    SetHotkey(number: number): void;
    Inventory: HerobarInventory;
}

interface DragImage extends ItemImage {
    m_DragItem: ItemEntityIndex;
    m_DragCompleted: boolean;
}

interface DragCallback {
    displayPanel: DragImage | Panel;
    offsetX: number;
    offsetY: number;
}

interface CustomTooltip {
    Refresh(): void;
    Hide(): void;
    Show(...args: any): void;
}