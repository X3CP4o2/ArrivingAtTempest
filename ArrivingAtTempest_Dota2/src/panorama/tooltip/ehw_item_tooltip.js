"use strict";
class CustomItemTooltip {
    constructor() {
        this.lastItemData = {
            isShowing: false,
            panel: null
        };
        this.Hide = () => {
        };
        this.Show = (itemIndex, panel) => {
        };
        this.Refresh = () => {
        };
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
}
GameUI.CustomUIConfig().ItemTooltip = new CustomItemTooltip();
