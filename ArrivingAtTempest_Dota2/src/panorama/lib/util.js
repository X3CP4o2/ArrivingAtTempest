"use strict";
var PanelIdentifiers;
(function (PanelIdentifiers) {
    PanelIdentifiers["HUD"] = "hud";
    PanelIdentifiers["TOOLTIPS"] = "Tooltips";
    PanelIdentifiers["TOOLTIP_ABILITY"] = "DOTAAbilityTooltip";
    PanelIdentifiers["TOOLTIP_ABILITY_DESCRIPTION"] = "AbilityDescriptionContainer";
    PanelIdentifiers["TOOLTIP_ABILITY_BUTTON"] = "AbilityButton";
    PanelIdentifiers["TOOLTIP_ABILITY_LEVEL_CONTAINER"] = "AbilityLevelContainer";
    PanelIdentifiers["TOOLTIP_ABILITY_DETAILS"] = "AbilityDetails";
    PanelIdentifiers["TOOLTIP_ABILITY_DETAILS_DAMAGETYPE"] = "AbilityDamageType";
    PanelIdentifiers["TOOLTIP_ABILITY_DETAILS_COREDETAILS"] = "AbilityCoreDetails";
    PanelIdentifiers["TOOLTIP_ABILITY_DETAILS_COREDETAILS_EXTRAATTRIBUTES"] = "AbilityExtraAttributes";
    PanelIdentifiers["TOOLTIP_ABILITY_LEVELUPTAB"] = "LevelUpTab";
})(PanelIdentifiers || (PanelIdentifiers = {}));
var CustomAbilityTooltipPanelIdentifiers;
(function (CustomAbilityTooltipPanelIdentifiers) {
    CustomAbilityTooltipPanelIdentifiers["DAMAGE"] = "AbilityCustomDamage";
    CustomAbilityTooltipPanelIdentifiers["DAMAGE_DETAILS"] = "AbilityCustomDamageDetails";
    CustomAbilityTooltipPanelIdentifiers["ABILITY_UPRADE"] = "CustomAbilityUpgrade";
})(CustomAbilityTooltipPanelIdentifiers || (CustomAbilityTooltipPanelIdentifiers = {}));
var PanoramaEvents;
(function (PanoramaEvents) {
    PanoramaEvents["DOTAShowAbilityTooltipForEntityIndex"] = "DOTAShowAbilityTooltipForEntityIndex";
    PanoramaEvents["DOTAPlayerUpdateSelectedUnit"] = "dota_player_update_selected_unit";
    PanoramaEvents["DOTAPortraitAbilityLayoutChanged"] = "dota_portrait_ability_layout_changed";
    PanoramaEvents["DOTAAbilityChanged"] = "dota_ability_changed";
    PanoramaEvents["DOTAPortraitUnitModifiersChanged"] = "dota_portrait_unit_modifiers_changed";
})(PanoramaEvents || (PanoramaEvents = {}));
var PanelEvents;
(function (PanelEvents) {
    PanelEvents["OnActivate"] = "onactivate";
    PanelEvents["OnCancel"] = "oncancel";
    PanelEvents["OnContextMenu"] = "oncontextmenu";
    PanelEvents["OnDblClick"] = "ondblclick";
    PanelEvents["OnDeselect"] = "ondeselect";
    PanelEvents["OneConsetLoaded"] = "oneconsetloaded";
    PanelEvents["OnFilled"] = "onfilled";
    PanelEvents["OnFindMatchEnd"] = "onfindmatchend";
    PanelEvents["OnFindMatchStart"] = "onfindmatchstart";
    PanelEvents["OnFocus"] = "onfocus";
    PanelEvents["OnInputSubmit"] = "oninputsubmit";
    PanelEvents["OnLoad"] = "onload";
    PanelEvents["OnMouseActivate"] = "onmouseactivate";
    PanelEvents["OnMouseOut"] = "onmouseout";
    PanelEvents["OnMouseOver"] = "onmouseover";
    PanelEvents["OnMoveDown"] = "onmovedown";
    PanelEvents["OnMoveLeft"] = "onmoveleft";
    PanelEvents["OnMoveRight"] = "onmoveright";
    PanelEvents["OnMoveUp"] = "onmoveup";
    PanelEvents["OnNotFilled"] = "onnotfilled";
    PanelEvents["OnPageSetupSuccess"] = "onpagesetupsuccess";
    PanelEvents["OnPopupsDismissed"] = "onpopupsdismissed";
    PanelEvents["OnSelect"] = "onselect";
    PanelEvents["OnTabForward"] = "ontabforward";
    PanelEvents["OnTextEntryChange"] = "ontextentrychange";
    PanelEvents["OnTextEntrySubmit"] = "ontextentrysubmit";
    PanelEvents["OnTooltipLoaded"] = "ontooltiploaded";
    PanelEvents["OnValueChanged"] = "onvaluechanged";
})(PanelEvents || (PanelEvents = {}));
var CustomNetTableNames;
(function (CustomNetTableNames) {
    CustomNetTableNames["CustomData"] = "customdata1";
    CustomNetTableNames["CustomData2"] = "customdata2";
    CustomNetTableNames["CustomData3"] = "customdata3";
    CustomNetTableNames["CustomData4"] = "customdata4";
    CustomNetTableNames["CustomPerks"] = "customperks";
    CustomNetTableNames["ChosenPerks"] = "chosenperks";
    CustomNetTableNames["FunctionStats"] = "functiondata";
    CustomNetTableNames["DummyUnitData"] = "dummyunitdata";
    CustomNetTableNames["MechanicsData"] = "mechanicsdata";
    CustomNetTableNames["WavesData"] = "wavesdata";
    CustomNetTableNames["CustomShops"] = "customshops";
    CustomNetTableNames["DummyItems"] = "dummyitems";
})(CustomNetTableNames || (CustomNetTableNames = {}));
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
function InsertPanel(selectorParent, url) {
    var parent = $(selectorParent);
    var panel = $.CreatePanel("Panel", parent, "");
    panel.BLoadLayout(url, false, false);
    return panel;
}
function GetDotaHud() {
    var p = $.GetContextPanel();
    while (p !== null && p.id !== 'Hud') {
        p = p.GetParent();
    }
    return p;
}
function getPortraitLocalAbilityForSlot(slotIndex) {
    return Entities.GetAbility(Players.GetLocalPlayerPortraitUnit(), slotIndex);
}
function createSpanWithColorLocalize(text, color) {
    return createSpanWithColor($.Localize(text), color);
}
function createSpanWithColor(text, color) {
    return '<span color="' + color + '">' + text + '</span>';
}
const COLOR_ABILITY_TEXT_PROPERTY = "#596e89";
function AddConcactNumberArray(arrayA, arrayB) {
    const resultArray = [];
    arrayA = arrayA || [];
    arrayB = arrayB || [];
    const maxLength = Math.max(arrayA.length, arrayB.length);
    var lastIndexA = 0;
    var lastIndexB = 0;
    for (var i = 0; i < maxLength; i++) {
        if (i < arrayA.length) {
            lastIndexA = i;
        }
        if (i < arrayB.length) {
            lastIndexB = i;
        }
        const valueA = arrayA[lastIndexA] || 0;
        const valueB = arrayB[lastIndexB] || 0;
        resultArray[i] = valueA + valueB;
    }
    return resultArray;
}
function ReturnKeyMatchingValueWithinArray(map, value) {
    const keys = Object.getOwnPropertyNames(map);
    var currentValues;
    var currentKey;
    for (var i = 0; i < keys.length; i++) {
        currentKey = keys[i];
        currentValues = map[currentKey];
        for (var j = 0; j < currentValues.length; j++) {
            if (currentValues[j] == value) {
                return currentKey;
            }
        }
    }
    return null;
}
function ObjectArrayAtIndexToObject(arrayMap, index) {
    const result = {};
    for (var key in arrayMap) {
        const arrayValue = arrayMap[key];
        result[key] = AtIndexSafe(arrayValue, index);
    }
    return result;
}
function ObjectToArray(object) {
    const result = [];
    const names = Object.getOwnPropertyNames(object).sort();
    for (var key of names) {
        result.push(object[key]);
    }
    return result;
}
function AtIndexSafe(array, index) {
    return array[Math.min(array.length - 1, index)];
}
function MinMaxObjectToFixed(object) {
    return {
        min: object.min.toFixed(2),
        max: object.max.toFixed(2)
    };
}
function PanelBounds(panel) {
    const panelBounds = {};
    const panelPos = panel.GetPositionWithinWindow();
    panelBounds.x = panelPos.x;
    panelBounds.y = panelPos.y;
    panelBounds.width = panel.desiredlayoutwidth;
    panelBounds.height = panel.desiredlayoutheight;
    return panelBounds;
}
function NormalizedPanelBounds(panel) {
    const panelBounds = PanelBounds(panel);
    panelBounds.x = panelBounds.x * DISPLAY_WIDTH_RATIO;
    panelBounds.y = panelBounds.y * DISPLAY_HEIGHT_RATIO;
    panelBounds.width = panelBounds.width * DISPLAY_WIDTH_RATIO;
    panelBounds.height = panelBounds.height * DISPLAY_HEIGHT_RATIO;
    return panelBounds;
}
function GetMouseTarget() {
    const mouseEntities = GameUI.FindScreenEntities(GameUI.GetCursorPosition());
    const heroIndex = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    for (let mouseEntity of mouseEntities) {
        if (mouseEntity.accurateCollision && mouseEntity.entityIndex !== heroIndex) {
            return mouseEntity.entityIndex;
        }
    }
    return -1;
}
function GetMouseWorldPosition() {
    return GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition());
}
function GetLocalPlayerHeroIndex() {
    return Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
}
function GetUpdatedWorldZWithinScreen(position) {
    return Vector.FromArray(Game.ScreenXYToWorld(Game.WorldToScreenX(position.x, position.y, 0), Game.WorldToScreenY(position.x, position.y, 0)));
}
function GetXpInfo(unit) {
    const xpInfo = {
        current: Entities.GetCurrentXP(unit),
        needed: Entities.GetNeededXPToLevel(unit)
    };
    return xpInfo;
}
function RepeatUntilTrue(interval, func) {
    if (!func()) {
        $.Schedule(interval, () => RepeatUntilTrue(interval, func));
    }
}
