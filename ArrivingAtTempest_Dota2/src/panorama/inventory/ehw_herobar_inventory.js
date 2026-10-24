"use strict";
const InventoryURL = "file://{resources}/layout/custom_game/hud/ehw_inventory.xml";
const InventoryItemURL = "file://{resources}/layout/custom_game/hud/ehw_inventory_slot.xml";
const hud = GetDotaHud();
const InventorySlots = [
    "HeadSlot",
    "AmuletSlot",
    "MainSlot",
    "BodySlot",
    "SecondarySlot",
    "GlovesSlot",
    "RingSlot1",
    "RingSlot2",
    "BeltSlot",
    "BootsSlot",
    "BeltSlot1",
    "BeltSlot2",
    "InventorySlot1",
    "InventorySlot2",
    "InventorySlot3",
    "InventorySlot4",
    "InventorySlot5"
];
const HealthIndex = 10;
const ManaIndex = 11;
const SlotToHotkey = {
    [HealthIndex]: 1,
    [ManaIndex]: 2
};
const SlotIndices = Object.getOwnPropertyNames(SlotToHotkey).map((value) => Number(value));
const indexToSlot = (slotIndex) => {
    return InventorySlots[slotIndex];
};
class HerobarInventory {
    constructor() {
        this.isShowing = false;
        this.inventorySlots = [];
        this.dragOffset = {
            x: 0,
            y: 0
        };
        this.initInventoryUI = () => {
            // $.Msg("initUI"); 
            const tooltipsPanel = hud.FindChild(PanelIdentifiers.TOOLTIPS);
            this.panel = tooltipsPanel;
            this.inventoryPanel = this.panel.FindChildTraverse("InventoryContainerPanel");
            if (!this.inventoryPanel) {
                this.panel.BLoadLayout(InventoryURL, false, false);
                this.inventoryPanel = this.panel.FindChildTraverse("InventoryContainerPanel");
            }
            $.RegisterEventHandler("DragStart", this.inventoryPanel, this.OnDragStart);
            $.RegisterEventHandler("DragEnd", this.inventoryPanel, this.OnDragEnd);
            for (var i = 0; i < InventorySlots.length; i++) {
                var slotName = indexToSlot(i);
                var inventoryItem = this.panel.FindChildTraverse(InventorySlots[i] + "Container") || $.CreatePanel("Panel", this.panel.FindChildTraverse(slotName), InventorySlots[i] + "Container");
                inventoryItem.RemoveAndDeleteChildren();
                inventoryItem.BLoadLayout(InventoryItemURL, false, false);
                this.inventorySlots[i] = inventoryItem;
                this.inventorySlots[i].Inventory = this;
                this.inventorySlots[i].SetHotkey(this.getHotkeyForIndex(i));
            }
        };
        this.OnDragStart = (panelId, dragCallback) => {
            // $.Msg("OnDragStart");
            dragCallback.displayPanel = this.inventoryPanel;
            const mousePos = GameUI.GetCursorPosition();
            const panelPos = this.inventoryPanel.GetPositionWithinWindow();
            dragCallback.offsetX = Math.max(0, mousePos[0] - panelPos.x);
            dragCallback.offsetY = Math.max(0, mousePos[1] - panelPos.y);
            this.dragOffset.x = dragCallback.offsetX;
            this.dragOffset.y = dragCallback.offsetY;
            return true;
        };
        this.OnDragEnd = (panel, draggedPanel) => {
            // $.Msg("OnDragEnd");
            const mousePos = GameUI.GetCursorPosition();
            var posX = (mousePos[0] - this.dragOffset.x) * DISPLAY_HEIGHT_RATIO;
            var posY = (mousePos[1] - this.dragOffset.y) * DISPLAY_HEIGHT_RATIO;
            posX = Math.min(Math.max(0, posX), Game.GetScreenWidth() * DISPLAY_HEIGHT_RATIO - this.inventoryPanel.actuallayoutwidth);
            posY = Math.min(Math.max(0, posY), Game.GetScreenHeight() * DISPLAY_HEIGHT_RATIO - this.inventoryPanel.actuallayoutheight);
            this.inventoryPanel.style.x = posX + "px";
            this.inventoryPanel.style.y = posY + "px";
            $.DispatchEvent("DropInputFocus");
            return false;
        };
        this.refillUI = () => {
            const unitIndex = Players.GetLocalPlayerPortraitUnit();
            if (this.isShowing) {
                this.updateAllSlots(unitIndex);
            }
            else {
                this.updateBeltSlots(unitIndex);
            }
        };
        this.updateSlot = (unitIndex, slotIndex) => {
            var itemIndex = Entities.GetItemInSlot(unitIndex, slotIndex);
            var inventoryItem = this.inventorySlots[slotIndex];
            inventoryItem.SetAttributeInt("slotIndex", slotIndex);
            inventoryItem.SetAttributeInt("unitIndex", unitIndex);
            inventoryItem.SetAttributeInt("itemIndex", itemIndex);
            inventoryItem.Refresh();
        };
        this.updateAllSlots = (unitIndex) => {
            for (var i = 0; i < InventorySlots.length; i++) {
                this.updateSlot(unitIndex, i);
            }
        };
        this.updateBeltSlots = (unitIndex) => {
            for (var i = 0; i < SlotIndices.length; i++) {
                this.updateSlot(unitIndex, SlotIndices[i]);
            }
        };
        this.Show = () => {
            Game.EmitSound("General.ButtonClick");
            this.refillUI();
            this.inventoryPanel.style.opacity = "1";
        };
        this.Hide = () => {
            Game.EmitSound("General.ButtonClickRelease");
            this.inventoryPanel.style.opacity = "0";
        };
        this.initButton = () => {
            this.inventoryButton.text = $.Localize("#INVENTORY");
            this.inventoryButton.style.verticalAlign = "center";
            this.inventoryButton.style.transform = "rotateX(180deg) rotateY(180deg) rotateZ(90deg)";
            // this.inventoryButton.style.backgroundColor = "gradient( radial, 0% 0%, 20% 20%, 20% 20%, from( #00000000 ), to( #000000ff ) )";
            this.isShowing = false;
            this.inventoryButton.SetPanelEvent("onmouseover", () => {
                this.inventoryButton.GetChild(0).style.color = COLOR_ABILITY_TEXT_PROPERTY;
            });
            this.inventoryButton.SetPanelEvent("onmouseout", () => {
                if (!this.isShowing)
                    this.inventoryButton.GetChild(0).style.color = "#ccc";
            });
            this.inventoryButton.SetPanelEvent("onmouseactivate", this.toggleInventory);
            // Game.CreateCustomKeyBind("key_I", "+ToggleInventory");
            Game.AddCommand("+ToggleInventory", this.toggleInventory, "", 0);
        };
        this.toggleInventory = () => {
            $.Msg("Toggle");
            if (!this.isShowing) {
                this.inventoryButton.GetChild(0).style.color = COLOR_ABILITY_TEXT_PROPERTY;
                this.isShowing = true;
                this.Show();
            }
            else {
                this.inventoryButton.GetChild(0).style.color = "#ccc";
                this.isShowing = false;
                this.Hide();
            }
        };
        hud.FindChildTraverse("inventory_tpscroll_container").style.opacity = "0";
        hud.FindChildTraverse("inventory_neutral_slot_container").style.opacity = "0";
        const centerBlock = hud.FindChildTraverse("center_block");
        const shadowRight = centerBlock.FindChildrenWithClassTraverse("AbilityInsetShadowRight")[0];
        const inventoryButtonContainer = centerBlock.FindChild("InventoryButtonContainer") || $.CreatePanel("Panel", centerBlock, 'InventoryButtonContainer');
        centerBlock.MoveChildAfter(inventoryButtonContainer, shadowRight);
        inventoryButtonContainer.style.height = "145px";
        inventoryButtonContainer.style.width = "100px";
        inventoryButtonContainer.style.verticalAlign = "bottom";
        inventoryButtonContainer.style.horizontalAlign = "right";
        inventoryButtonContainer.style.marginRight = "220px";
        inventoryButtonContainer.RemoveAndDeleteChildren();
        this.inventoryButton = $.CreatePanel("TextButton", inventoryButtonContainer, 'InventoryToggleButton');
        this.initButton();
        this.initInventoryUI();
        this.refillUI();
        GameEvents.Subscribe("dota_inventory_changed", this.refillUI);
        GameEvents.Subscribe("dota_inventory_item_changed", this.refillUI);
        GameEvents.Subscribe("m_event_dota_inventory_changed_query_unit", this.refillUI);
        GameEvents.Subscribe("m_event_keybind_changed", this.refillUI);
        GameEvents.Subscribe("dota_player_update_selected_unit", this.refillUI);
        GameEvents.Subscribe("dota_player_update_query_unit", this.refillUI);
        Game.AddCommand("+HealthPot", () => {
            $.Msg("Pressed HealthPot.");
            this.inventorySlots[HealthIndex].Activate();
        }, "", 0);
        Game.AddCommand("+ManaPot", () => {
            $.Msg("Pressed ManaPot");
            this.inventorySlots[ManaIndex].Activate();
        }, "", 0);
    }
    getHotkeyForIndex(index) {
        return SlotToHotkey[index] || -1;
    }
    isSlotDraggableInBounds() {
        const inventoryPos = this.inventoryPanel.GetPositionWithinWindow();
        inventoryPos.x = inventoryPos.x * DISPLAY_WIDTH_RATIO;
        inventoryPos.y = inventoryPos.y * DISPLAY_HEIGHT_RATIO;
        const inventoryWidth = this.inventoryPanel.actuallayoutwidth * DISPLAY_WIDTH_RATIO;
        const inventoryHeight = this.inventoryPanel.actuallayoutheight * DISPLAY_HEIGHT_RATIO;
        const draggablePos = GameUI.GetCursorPosition();
        draggablePos[0] *= DISPLAY_WIDTH_RATIO;
        draggablePos[1] *= DISPLAY_HEIGHT_RATIO;
        return (draggablePos[0] >= inventoryPos.x && draggablePos[0] <= inventoryPos.x + inventoryWidth)
            && (draggablePos[1] >= inventoryPos.y && draggablePos[1] <= inventoryPos.y + inventoryHeight);
    }
}
if (!GameUI.CustomUIConfig().HerobarInventory)
    GameUI.CustomUIConfig().HerobarInventory = new HerobarInventory();
