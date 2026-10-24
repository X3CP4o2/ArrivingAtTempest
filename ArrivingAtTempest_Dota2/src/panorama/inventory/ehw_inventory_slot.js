"use strict";
class InventorySlot {
    constructor() {
        // $.Msg("ContextPanel ", $.GetContextPanel().id);
        this.hasItem = false;
        this.itemName = "";
        this.isDragging = false;
        this.setHotkey = (number) => {
            this.hotkey = number;
            if (this.hotkey != -1) {
                const hotkeyPanel = $("#Hotkey");
                const hotkeyText = $("#HotkeyText");
                hotkeyText.text = "" + this.hotkey;
                hotkeyPanel.style.opacity = "1";
            }
        };
        this.setStackCount = (number) => {
            const stackCountLabel = $("#AltChargeCount");
            if (number != -1) {
                stackCountLabel.text = String(number);
                stackCountLabel.style.opacity = "1";
            }
            else {
                stackCountLabel.style.opacity = "0";
            }
        };
        this.Refresh = () => {
            // $.Msg("Refresh");
            const itemPanel = $.GetContextPanel();
            this.unitIndex = itemPanel.GetAttributeInt("unitIndex", -1);
            this.itemIndex = itemPanel.GetAttributeInt("itemIndex", -1);
            this.slotIndex = itemPanel.GetAttributeInt("slotIndex", -1);
            this.isDragging = false;
            this.hasItem = this.itemIndex != -1;
            if (this.hasItem) {
                this.itemName = Abilities.GetAbilityName(this.itemIndex);
                this.itemImagePanel.itemname = this.itemName;
                this.itemImagePanel.contextEntityIndex = this.itemIndex;
                if (Items.IsStackable(this.itemIndex)) {
                    this.setStackCount(Items.GetCurrentCharges(this.itemIndex));
                }
                else {
                    this.setStackCount(-1);
                }
            }
            else {
                this.itemImagePanel.itemname = "";
                this.itemImagePanel.contextEntityIndex = -1;
                this.setStackCount(-1);
            }
            GameUI.CustomUIConfig().ItemTooltip.Refresh();
        };
        this.ShowTooltip = () => {
            if (!this.hasItem || this.isDragging) {
                return;
            }
            // GameUI.CustomUIConfig().ItemTooltip.Show(this.itemIndex, this.itemPanel);
            GameUI.CustomUIConfig().ItemTooltip.Show(this.itemIndex, this.itemPanel);
            // $.Msg("ShowTooltip");
        };
        this.HideTooltip = () => {
            if (!this.hasItem) {
                return;
            }
            GameUI.CustomUIConfig().ItemTooltip.Hide();
            // $.Msg("HideTooltip");
        };
        this.Activate = () => {
            if (!this.hasItem) {
                return;
            }
            $.Msg("Activate");
            Abilities.ExecuteAbility(this.itemIndex, this.unitIndex, false);
        };
        this.DoubleClick = () => {
            if (!this.hasItem) {
                return;
            }
            this.Activate();
        };
        this.RightClick = () => {
            if (!this.hasItem || this.isDragging) {
                // $.Msg("this.hasItem: ", this.hasItem, " this.isDragging: ", this.isDragging);
                return;
            }
            GameEvents.SendCustomGameEventToServer("Inventory_QuickMove", {
                "itemIndex": this.itemIndex,
                "itemSlot": this.slotIndex,
                "unitIndex": this.unitIndex
            });
            this.HideTooltip();
        };
        this.OnDragEnter = (panel, draggedPanel) => {
            // $.Msg("[OnDragEnter] ", panel.id, " ", draggedPanel.id);
            if (draggedPanel.m_DragItem == null || draggedPanel.m_DragItem == this.itemIndex)
                return false;
            this.itemPanel.SetHasClass("Highlight", true);
            return true;
        };
        this.OnDragLeave = (panel, draggedPanel) => {
            // $.Msg("[OnDragLeave] ", panel.id, " ", draggedPanel.id);
            if (draggedPanel.m_DragItem == null || draggedPanel.m_DragItem == this.itemIndex)
                return false;
            this.itemPanel.SetHasClass("Highlight", false);
        };
        this.OnDragDrop = (panel, draggedPanel) => {
            // $.Msg("[OnDragDrop] ", panel.id, " ", draggedPanel.id);
            if (draggedPanel.m_DragItem === null) {
                return true;
            }
            draggedPanel.m_DragCompleted = true;
            const moveItemorder = {
                OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_ITEM,
                TargetIndex: this.slotIndex,
                AbilityIndex: draggedPanel.m_DragItem
            };
            Game.PrepareUnitOrders(moveItemorder);
            $.Schedule(0.2, () => {
                if (this.itemIndex == draggedPanel.m_DragItem) {
                    GameUI.CustomUIConfig().ItemTooltip.Show(draggedPanel.m_DragItem, this.itemPanel);
                }
            });
            this.isDragging = false;
            return true;
        };
        this.OnDragStart = (panelId, dragCallback) => {
            if (!this.hasItem) {
                return false;
            }
            // $.Msg("[OnDragStart] ", panelId, " ", dragCallbacks);
            this.HideTooltip();
            // create a temp panel that will be dragged around
            var displayPanel = $.CreatePanel("DOTAItemImage", $.GetContextPanel(), "dragItem");
            displayPanel.itemname = this.itemName;
            displayPanel.contextEntityIndex = this.itemIndex;
            displayPanel.m_DragItem = this.itemIndex;
            displayPanel.m_DragCompleted = false; // whether the drag was successful
            // hook up the display panel, and specify the panel offset from the cursor
            dragCallback.displayPanel = displayPanel;
            dragCallback.offsetX = 0;
            dragCallback.offsetY = 0;
            // grey out the source panel while dragging
            this.itemPanel.SetHasClass("dragging_from", true);
            this.isDragging = true;
            return true;
        };
        this.OnDragEnd = (panel, draggedPanel) => {
            if (!this.hasItem) {
                return true;
            }
            // $.Msg("[OnDragEnd] ", panelId.id, " ", draggedPanel.id);
            if (!draggedPanel.ignoreDrop && (!(this.itemPanel.Inventory.isSlotDraggableInBounds() || draggedPanel.m_DragCompleted))) {
                // $.Msg("Drop Item");
                GameEvents.SendCustomGameEventToServer("Inventory_DropItem", {
                    "itemIndex": draggedPanel.m_DragItem,
                    "itemSlot": this.slotIndex,
                    "unitIndex": this.unitIndex
                });
            }
            draggedPanel.DeleteAsync(0);
            this.isDragging = false;
            this.itemPanel.SetHasClass("dragging_from", false);
            return true;
        };
        $.GetContextPanel().Refresh = this.Refresh;
        $.GetContextPanel().Activate = this.Activate;
        $.GetContextPanel().SetHotkey = this.setHotkey;
        this.itemPanel = $.GetContextPanel();
        this.unitIndex = this.itemPanel.GetAttributeInt("unitIndex", -1);
        this.itemIndex = this.itemPanel.GetAttributeInt("itemIndex", -1);
        this.slotIndex = this.itemPanel.GetAttributeInt("slotIndex", -1);
        this.hotkey = this.itemPanel.GetAttributeInt("hotkey", -1);
        this.itemImagePanel = $("#ItemImage");
        $.RegisterEventHandler("DragEnter", this.itemPanel, this.OnDragEnter);
        $.RegisterEventHandler("DragDrop", this.itemPanel, this.OnDragDrop);
        $.RegisterEventHandler("DragLeave", this.itemPanel, this.OnDragLeave);
        $.RegisterEventHandler("DragStart", this.itemPanel, this.OnDragStart);
        $.RegisterEventHandler("DragEnd", this.itemPanel, this.OnDragEnd);
    }
}
var inventorySlot;
if (!inventorySlot)
    inventorySlot = new InventorySlot();
