const manabarXml = "file://{resources}/layout/custom_game/hud/manabar.xml";

interface StatBar {
    min: number;
    max: number;
    current: number;
}

class ManaBar {

    stats: StatBar;
    progressBar!: ProgressBar;

    constructor() {
        $.Msg("ManaBar Script initialized.");
        this.stats = {
            min: 0,
            max: 0,
            current: 0
        }
    }

    public SetContainer(parentContainer: Panel) {
        if (parentContainer.BLoadLayout(manabarXml, true, false)) {
            $.Msg("Mana Progressbar Container set.");
            this.progressBar = parentContainer.FindChildTraverse("ProgressBar") as ProgressBar;
            if (!this.progressBar) {
                $.Msg("Couldn't find Mana ProgressBar");
                return;
            }
        } else {
            $.Msg("Couldn't load ManaBarXML.");
            return;
        }

        RepeatUntilTrue(0.5, () => {
            const localHeroIndex = GetLocalPlayerHeroIndex();
            if (localHeroIndex) {
                this.UpdateStats();
                return true;
            }
            return false;
        });
        GameEvents.Subscribe("dota_portrait_unit_stats_changed", this.UpdateStats);
    }

    private UpdateStats = () => {
        const localHeroIndex = GetLocalPlayerHeroIndex();
        if (localHeroIndex) {
            this.stats.current = Entities.GetMana(localHeroIndex);
            this.stats.max = Entities.GetMaxMana(localHeroIndex);
            this.UpdateProgressBar();
        }
    }


    private UpdateProgressBar = () => {
        $.Msg("Update Mana ProgressBar: ", this.stats);
        this.progressBar.min = this.stats.min;
        this.progressBar.max = this.stats.max;
        this.progressBar.value = this.stats.current;
    }
}

GameUI.CustomUIConfig().HeroManaBar = new ManaBar();