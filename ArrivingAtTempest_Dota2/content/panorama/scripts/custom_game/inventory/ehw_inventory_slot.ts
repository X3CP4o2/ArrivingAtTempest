class InventorySlot {

    private unitIndex: EntityIndex;
    private itemIndex: ItemEntityIndex;
    private slotIndex: number;
    private hotkey: number;

    private itemPanel: InventorySlotPanel;
    private itemImagePanel: ItemImage;

    private hasItem: boolean = false;
    private itemName: string = "";
    private isDragging: boolean = false;

    public Inventory!: HerobarInventory;

    constructor() {
        // $.Msg("ContextPanel ", $.GetContextPanel().id);

        (<InventorySlotPanel>$.GetContextPanel()).Refresh = this.Refresh;
        (<InventorySlotPanel>$.GetContextPanel()).Activate = this.Activate;
        (<InventorySlotPanel>$.GetContextPanel()).SetHotkey = this.setHotkey;
        this.itemPanel = <InventorySlotPanel> $.GetContextPanel();

        this.unitIndex = <EntityIndex> this.itemPanel.GetAttributeInt("unitIndex", -1);
        this.itemIndex = <ItemEntityIndex> this.itemPanel.GetAttributeInt("itemIndex", -1);
        this.slotIndex = this.itemPanel.GetAttributeInt("slotIndex", -1);
        this.hotkey = this.itemPanel.GetAttributeInt("hotkey", -1);
    
        this.itemImagePanel = <ItemImage>$("#ItemImage");

        $.RegisterEventHandler("DragEnter", this.itemPanel, this.OnDragEnter);
        $.RegisterEventHandler("DragDrop", this.itemPanel, this.OnDragDrop);
        $.RegisterEventHandler("DragLeave", this.itemPanel, this.OnDragLeave);
        $.RegisterEventHandler("DragStart", this.itemPanel, this.OnDragStart);
        $.RegisterEventHandler("DragEnd", this.itemPanel, this.OnDragEnd);

    }

    public setHotkey = (number: number): void => {
        this.hotkey = number;

        if( this.hotkey != -1 ) {
            const hotkeyPanel = $("#Hotkey");
            const hotkeyText = <LabelPanel> $("#HotkeyText");
            hotkeyText.text = "" + this.hotkey;
            hotkeyPanel.style.opacity = "1";
        }
    }

    public setStackCount = (number: number): void => {
        const stackCountLabel = <LabelPanel> $("#AltChargeCount");
        if(number != -1) {
            stackCountLabel.text = String(number);
            stackCountLabel.style.opacity = "1";
        } else {
            stackCountLabel.style.opacity = "0";
        }
    }

    public Refresh = (): void => {
        // $.Msg("Refresh");

        const itemPanel = $.GetContextPanel();

        this.unitIndex = <EntityIndex> itemPanel.GetAttributeInt("unitIndex", -1);
        this.itemIndex = <ItemEntityIndex> itemPanel.GetAttributeInt("itemIndex", -1);
        this.slotIndex = itemPanel.GetAttributeInt("slotIndex", -1);
        
        this.isDragging = false;
        this.hasItem = this.itemIndex != -1;

        if(this.hasItem) {
            this.itemName = Abilities.GetAbilityName(this.itemIndex);
            this.itemImagePanel.itemname = this.itemName;
            this.itemImagePanel.contextEntityIndex = this.itemIndex;
            if( Items.IsStackable(this.itemIndex) ) {
                this.setStackCount(Items.GetCurrentCharges(this.itemIndex));
            } else {
                this.setStackCount(-1);
            }
            
        } else {
            this.itemImagePanel.itemname = "";
            this.itemImagePanel.contextEntityIndex = <never>-1;
            this.setStackCount(-1);
        }

        GameUI.CustomUIConfig().ItemTooltip.Refresh();
    }

    public ShowTooltip = (): void => {
        if(!this.hasItem || this.isDragging){
            return;
        }
        // GameUI.CustomUIConfig().ItemTooltip.Show(this.itemIndex, this.itemPanel);
        GameUI.CustomUIConfig().ItemTooltip.Show(this.itemIndex, this.itemPanel);
        // $.Msg("ShowTooltip");
    }

    public HideTooltip = (): void => {
        if(!this.hasItem){
            return;
        }
        GameUI.CustomUIConfig().ItemTooltip.Hide();
        // $.Msg("HideTooltip");
    }

    public Activate = (): void => {
        if(!this.hasItem){
            return;
        }
        $.Msg("Activate");
        
        Abilities.ExecuteAbility(this.itemIndex, this.unitIndex, false);
    }

    public DoubleClick = (): void => {
        if(!this.hasItem){
            return;
        }
        this.Activate();
    }

    public RightClick = (): void => {
        if(!this.hasItem || this.isDragging){
            // $.Msg("this.hasItem: ", this.hasItem, " this.isDragging: ", this.isDragging);
            return;
        }
        GameEvents.SendCustomGameEventToServer("Inventory_QuickMove", <never>{
            "itemIndex": this.itemIndex,
            "itemSlot": this.slotIndex,
            "unitIndex": this.unitIndex
        });

        this.HideTooltip();
    }

    public OnDragEnter = (panel: Panel, draggedPanel: DragImage) => {
        // $.Msg("[OnDragEnter] ", panel.id, " ", draggedPanel.id);
        if(draggedPanel.m_DragItem == null || draggedPanel.m_DragItem == this.itemIndex)
            return false;
        
        this.itemPanel.SetHasClass("Highlight", true);
        return true;
    }

    public OnDragLeave = (panel: Panel, draggedPanel: DragImage ) => {
        // $.Msg("[OnDragLeave] ", panel.id, " ", draggedPanel.id);
        
        if(draggedPanel.m_DragItem == null || draggedPanel.m_DragItem == this.itemIndex)
            return false;
        this.itemPanel.SetHasClass("Highlight", false);
    }

    public OnDragDrop = (panel: Panel, draggedPanel: DragImage ) => {
        // $.Msg("[OnDragDrop] ", panel.id, " ", draggedPanel.id);

        if(draggedPanel.m_DragItem === null) {
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
            if(this.itemIndex == draggedPanel.m_DragItem){
                GameUI.CustomUIConfig().ItemTooltip.Show(draggedPanel.m_DragItem, this.itemPanel);
            }
        });

        this.isDragging = false;
        return true;
    }
    


    public OnDragStart = (panelId: string, dragCallback: DragCallback ): boolean => {
        if(!this.hasItem){
            return false;
        }
        // $.Msg("[OnDragStart] ", panelId, " ", dragCallbacks);
        this.HideTooltip();

        // create a temp panel that will be dragged around
	    var displayPanel = <DragImage>$.CreatePanel( "DOTAItemImage", $.GetContextPanel(), "dragItem" );
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
    }
    public OnDragEnd = ( panel: Panel, draggedPanel: any ) => {
        if(!this.hasItem){
            return true;
        }
        // $.Msg("[OnDragEnd] ", panelId.id, " ", draggedPanel.id);

        if (!(<any>draggedPanel).ignoreDrop && ( ! (this.itemPanel.Inventory.isSlotDraggableInBounds() || draggedPanel.m_DragCompleted) ) )
	    {
            // $.Msg("Drop Item");
		    GameEvents.SendCustomGameEventToServer("Inventory_DropItem", <never>{
                "itemIndex": draggedPanel.m_DragItem,
                "itemSlot": this.slotIndex,
                "unitIndex": this.unitIndex
            });
        }

        draggedPanel.DeleteAsync(0);
        this.isDragging = false;
        this.itemPanel.SetHasClass("dragging_from", false);
        return true;
    }
}
var inventorySlot;
if(!inventorySlot)
    inventorySlot = new InventorySlot()