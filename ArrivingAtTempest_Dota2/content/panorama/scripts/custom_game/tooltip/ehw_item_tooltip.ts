interface LastItemTooltip {
    isShowing: boolean;
    panel: Panel | null;
}

class CustomItemTooltip implements CustomTooltip{

    private rootPanel: Panel;
    private tooltipsPanel: Panel;
    private abilityTooltipPanel: Panel | null;
    private itemSubtitle!: LabelPanel;

    private lastItemData: LastItemTooltip = {
        isShowing: false,
        panel: null
    };

    constructor() {
        const rootPanel = GetDotaHud();
        if (rootPanel == null) {
            throw new Error("HUD not found!");
        }
        this.rootPanel = rootPanel;

        const tooltipsPanel = this.rootPanel.FindChild(PanelIdentifiers.TOOLTIPS);
        if (tooltipsPanel == null) {
            throw new Error("Tooltips Panel not found!");
        }
        this.tooltipsPanel = tooltipsPanel;
        this.abilityTooltipPanel = this.tooltipsPanel.FindChild(PanelIdentifiers.TOOLTIP_ABILITY);
    }

    public Hide = () => {
    }

    public Show = ( itemIndex: ItemEntityIndex, panel: Panel | null) => {
        
    }

    public Refresh = () => {

    }
}

GameUI.CustomUIConfig().ItemTooltip = new CustomItemTooltip();