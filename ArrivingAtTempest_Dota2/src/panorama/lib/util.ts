enum PanelIdentifiers {
    HUD = "hud",
    TOOLTIPS = "Tooltips",
    TOOLTIP_ABILITY = "DOTAAbilityTooltip",
    TOOLTIP_ABILITY_DESCRIPTION = "AbilityDescriptionContainer",
    TOOLTIP_ABILITY_BUTTON = "AbilityButton",
    TOOLTIP_ABILITY_LEVEL_CONTAINER = "AbilityLevelContainer",
    TOOLTIP_ABILITY_DETAILS = "AbilityDetails",
    TOOLTIP_ABILITY_DETAILS_DAMAGETYPE = "AbilityDamageType",
    TOOLTIP_ABILITY_DETAILS_COREDETAILS = "AbilityCoreDetails",
    TOOLTIP_ABILITY_DETAILS_COREDETAILS_EXTRAATTRIBUTES = "AbilityExtraAttributes",
    TOOLTIP_ABILITY_LEVELUPTAB = "LevelUpTab"
}

enum CustomAbilityTooltipPanelIdentifiers {
    DAMAGE = "AbilityCustomDamage",
    DAMAGE_DETAILS = "AbilityCustomDamageDetails",
    ABILITY_UPRADE = "CustomAbilityUpgrade"
}

enum PanoramaEvents {
    DOTAShowAbilityTooltipForEntityIndex = "DOTAShowAbilityTooltipForEntityIndex",
    DOTAPlayerUpdateSelectedUnit = "dota_player_update_selected_unit",
    DOTAPortraitAbilityLayoutChanged = "dota_portrait_ability_layout_changed",
    DOTAAbilityChanged = "dota_ability_changed",
    DOTAPortraitUnitModifiersChanged = "dota_portrait_unit_modifiers_changed"

}

enum PanelEvents{
    OnActivate = "onactivate",
    OnCancel = "oncancel",
    OnContextMenu = "oncontextmenu",
    OnDblClick = "ondblclick",
    OnDeselect = "ondeselect",
    OneConsetLoaded = "oneconsetloaded",
    OnFilled = "onfilled",
    OnFindMatchEnd = "onfindmatchend",
    OnFindMatchStart = "onfindmatchstart",
    OnFocus = "onfocus",
    OnInputSubmit = "oninputsubmit",
    OnLoad = "onload",
    OnMouseActivate = "onmouseactivate",
    OnMouseOut = "onmouseout",
    OnMouseOver = "onmouseover",
    OnMoveDown = "onmovedown",
    OnMoveLeft = "onmoveleft",
    OnMoveRight = "onmoveright",
    OnMoveUp = "onmoveup",
    OnNotFilled = "onnotfilled",
    OnPageSetupSuccess = "onpagesetupsuccess",
    OnPopupsDismissed = "onpopupsdismissed",
    OnSelect = "onselect",
    OnTabForward = "ontabforward",
    OnTextEntryChange = "ontextentrychange",
    OnTextEntrySubmit = "ontextentrysubmit",
    OnTooltipLoaded = "ontooltiploaded",
    OnValueChanged = "onvaluechanged"
}

enum CustomNetTableNames {
    CustomData = "customdata1",
    CustomData2 = "customdata2",
    CustomData3 = "customdata3",
    CustomData4 = "customdata4",
    CustomPerks = "customperks",
    ChosenPerks = "chosenperks",
    FunctionStats = "functiondata",
    DummyUnitData = "dummyunitdata",
    MechanicsData = "mechanicsdata",
    WavesData   =   "wavesdata",
    CustomShops = "customshops",
    DummyItems = "dummyitems"
}

const EquipmentTypeMap = [
    "Helmet",
    "Amulet",
    "Primary",
    "Armor",
    "Secondary",
    "Gloves",
    "Ring",
    "Ring",
    "Belt",
    "Boots",
    "Health",
    "Mana"
];

const DISPLAY_WIDTH_RATIO = 1920 / Game.GetScreenWidth();
const DISPLAY_HEIGHT_RATIO = 1080 / Game.GetScreenHeight();

function InsertPanel( selectorParent: string, url: string) {
    var parent = $(selectorParent);
	var panel = $.CreatePanel( "Panel", parent , "" );
    panel.BLoadLayout( url, false, false );
    return panel;
}

function GetDotaHud(): Panel | null {
    var p: Panel | null = $.GetContextPanel();

    while (p !== null && p.id !== 'Hud') {
        p = p.GetParent();
    }
     return p;
}

function getPortraitLocalAbilityForSlot(slotIndex: number): AbilityEntityIndex {
    return Entities.GetAbility(Players.GetLocalPlayerPortraitUnit(), slotIndex);
}

function createSpanWithColorLocalize(text: string, color: string) {
    return createSpanWithColor($.Localize(text), color);
}
function createSpanWithColor(text: string | number, color: string) {
    return '<span color="' + color + '">' + text + '</span>';
}

const COLOR_ABILITY_TEXT_PROPERTY = "#596e89";

function AddConcactNumberArray(arrayA: number[], arrayB: number[]): number[] {
    const resultArray: number[] = [];

    arrayA = arrayA || [];
    arrayB = arrayB || [];

    const maxLength = Math.max(arrayA.length, arrayB.length);

    var lastIndexA = 0;
    var lastIndexB = 0;

    for(var i = 0; i < maxLength; i++) {
        if(i < arrayA.length ){
            lastIndexA = i;
        }
        if(i < arrayB.length){
            lastIndexB = i;
        }

        const valueA = arrayA[lastIndexA] || 0;
        const valueB = arrayB[lastIndexB] || 0;

        resultArray[i] = valueA + valueB;
    }

    return resultArray;
}

type GenericObjectMap<K extends string | number | symbol, V> = {
    [key in K]: V;
}

function ReturnKeyMatchingValueWithinArray<K extends string, V>(map: GenericObjectMap<K, V[]>, value: V): K | null {
    const keys = <K[]>Object.getOwnPropertyNames(map);
    var currentValues;
    var currentKey;
    for(var i = 0; i < keys.length; i++) {
        currentKey = keys[i];
        currentValues = map[currentKey];
        for(var j = 0; j < currentValues.length; j++) {
            if(currentValues[j] == value) {
                return currentKey;
            }
        }
    }
    return null;
}

function ObjectArrayAtIndexToObject(arrayMap: {[key:string]: any[]}, index: number): {[key: string]: number} {
    const result: {[key: string]: number} = {};
    for(var key in arrayMap) {
        const arrayValue = arrayMap[key];
        result[key] = AtIndexSafe(arrayValue, index);
    }
    return result;
}

function ObjectToArray(object: {[key: string]: any}): any[]{
    const result = [];
    const names = Object.getOwnPropertyNames(object).sort();
    for(var key of names){
        result.push(object[key]);
    }
    return result;
}

function AtIndexSafe(array: any[], index: number): any {
    return array[Math.min(array.length - 1, index)];
}

function MinMaxObjectToFixed(object: {min: number, max: number}): {min: string, max: string} {
    return {
        min: object.min.toFixed(2),
        max: object.max.toFixed(2)
    };
}

type PanelBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
}

function PanelBounds(panel: Panel): PanelBounds {
    const panelBounds: PanelBounds = <PanelBounds>{};
    const panelPos = panel.GetPositionWithinWindow();

    panelBounds.x = panelPos.x;
    panelBounds.y = panelPos.y;
    panelBounds.width = panel.desiredlayoutwidth;
    panelBounds.height = panel.desiredlayoutheight;

    return panelBounds;
}

function NormalizedPanelBounds(panel: Panel): PanelBounds {
    const panelBounds: PanelBounds = PanelBounds(panel);

    panelBounds.x = panelBounds.x * DISPLAY_WIDTH_RATIO;
    panelBounds.y = panelBounds.y * DISPLAY_HEIGHT_RATIO;
    panelBounds.width = panelBounds.width * DISPLAY_WIDTH_RATIO;
    panelBounds.height = panelBounds.height * DISPLAY_HEIGHT_RATIO;

    return panelBounds;
}

function GetMouseTarget(){
    const mouseEntities = GameUI.FindScreenEntities(GameUI.GetCursorPosition());
    const heroIndex = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());

    for(let mouseEntity of mouseEntities){
        if(mouseEntity.accurateCollision && mouseEntity.entityIndex !== heroIndex){
            return mouseEntity.entityIndex;
        }
    }

    return -1;
}

function GetMouseWorldPosition(){
    return GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition());
}

function GetLocalPlayerHeroIndex(){
    return Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer())
}

function GetUpdatedWorldZWithinScreen(position: Vector){
    return Vector.FromArray(Game.ScreenXYToWorld(Game.WorldToScreenX(position.x, position.y, 0), Game.WorldToScreenY(position.x, position.y, 0)));
}

interface XPInfo {
    current: number;
    needed: number;
}

function GetXpInfo(unit: EntityIndex): XPInfo{
    const xpInfo: XPInfo = {
        current: Entities.GetCurrentXP(unit),
        needed: Entities.GetNeededXPToLevel(unit)
    }
    return xpInfo;
}

function RepeatUntilTrue(interval: number, func: () => boolean){
    if(!func()){
         $.Schedule(interval, () => RepeatUntilTrue(interval, func));
    }    
}