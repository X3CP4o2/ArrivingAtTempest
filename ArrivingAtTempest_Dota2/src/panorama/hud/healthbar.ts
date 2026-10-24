const healthbarXml = "file://{resources}/layout/custom_game/hud/healthbar.xml";

interface StatBar {
    min: number;
    max: number;
    current: number;
}

class HealthBar{

    stats: StatBar;
    progressBar!: ProgressBar;

    constructor() {
        $.Msg("HealthBar Script initialized.");
        this.stats = {
            min: 0,
            max: 0,
            current: 0
        }
    }

    public SetContainer(parentContainer: Panel) {
        if (parentContainer.BLoadLayout(healthbarXml, true, false)) {
            $.Msg("Health Progressbar Container set.");
            this.progressBar = parentContainer.FindChildTraverse("ProgressBar") as ProgressBar;
            if (!this.progressBar) {
                $.Msg("Couldn't find Health ProgressBar");
                return;
            }
        } else {
            $.Msg("Couldn't load HealthBarXML.");
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
            this.stats.current = Entities.GetHealth(localHeroIndex);
            this.stats.max = Entities.GetMaxHealth(localHeroIndex);
            this.UpdateProgressBar();
        }
    }


    private UpdateProgressBar = () => {
        $.Msg("Update Health ProgressBar: ", this.stats);
        this.progressBar.min = this.stats.min;
        this.progressBar.max = this.stats.max;
        this.progressBar.value = this.stats.current / 2;
    }
}

GameUI.CustomUIConfig().HeroHealthBar = new HealthBar();