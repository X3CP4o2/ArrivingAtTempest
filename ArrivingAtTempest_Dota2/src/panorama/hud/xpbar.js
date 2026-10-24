"use strict";
const XPBarXML = "file://{resources}/layout/custom_game/hud/xpbar.xml";
class XPBar {
    constructor() {
        this.oldNeeded = 0;
        this.UpdateCurrentExperience = () => {
            const localHeroIndex = GetLocalPlayerHeroIndex();
            if (localHeroIndex) {
                const xpInfo = GetXpInfo(localHeroIndex);
                this.UpdateXpInfo(xpInfo);
                this.UpdateProgressBar();
            }
        };
        this.OnHeroLeveled = (event) => {
            if (event.hero_entindex !== GetLocalPlayerHeroIndex()) {
                return;
            }
            const xpInfo = GetXpInfo(event.hero_entindex);
            this.UpdateXpInfo(xpInfo, true);
            this.UpdateProgressBar();
        };
        this.UpdateXpInfo = (xpInfo, hasLeveled = false) => {
            /* $.Msg("Update current: ", xpInfo.current, ", needed: ",  xpInfo.needed); */
            if (hasLeveled) {
                $.Msg("XPBar Levelup");
                this.oldNeeded = this.xpInfo.needed;
                this.xpInfo.needed = xpInfo.needed;
                // Play Effect
            }
            this.xpInfo.current = xpInfo.current;
            this.xpInfo.needed = xpInfo.needed;
        };
        this.UpdateProgressBar = () => {
            $.Msg("UpdateProgressBar current: ", this.xpInfo.current, ", needed: ", this.xpInfo.needed, ", oldNeeded: ", this.oldNeeded);
            this.progressBar.min = this.oldNeeded;
            this.progressBar.max = this.xpInfo.needed;
            this.progressBar.value = this.xpInfo.current;
        };
        $.Msg("XPBar Script initialized.");
        this.xpInfo = {
            needed: 0,
            current: 0
        };
    }
    SetContainer(parentContainer) {
        if (parentContainer.BLoadLayout(XPBarXML, true, false)) {
            $.Msg("XP Progressbar Container set.");
            this.progressBar = parentContainer.FindChildTraverse("ProgressBar");
            if (!this.progressBar) {
                $.Msg("Couldn't find ProgressBar");
                return;
            }
        }
        else {
            $.Msg("Couldn't load XPBarXML.");
            return;
        }
        RepeatUntilTrue(0.5, () => {
            const localHeroIndex = GetLocalPlayerHeroIndex();
            if (localHeroIndex) {
                const xpInfo = GetXpInfo(localHeroIndex);
                if (xpInfo.needed === 0) {
                    return false;
                }
                this.UpdateXpInfo(xpInfo, true);
                return true;
            }
            return false;
        });
        GameEvents.Subscribe("dota_player_gained_level", this.OnHeroLeveled);
        GameEvents.Subscribe("entity_killed", this.UpdateCurrentExperience);
        /* $.Schedule(0.5, this.UpdateCurrentExperience); */
    }
}
GameUI.CustomUIConfig().HeroXPBar = new XPBar();
