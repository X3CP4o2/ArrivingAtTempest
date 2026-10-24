const targetInfoXml = "file://{resources}/layout/custom_game/hud/targetinfo.xml";
const healthbarInfoXml = "file://{resources}/layout/custom_game/hud/healthbar.xml";
const manabarInfoXml = "file://{resources}/layout/custom_game/hud/manabar.xml";

const targetInfoScheduleInterval = 0.1;

class TargetInfo {

    scheduler!: ScheduleID;
    isShowing = false;
    target!: EntityIndex;

    targetInfoPanel!: Panel;
    targetInfoNameLabel!: LabelPanel;
    targetInfoHealthBar!: ProgressBar;
    targetInfoManaBar!: ProgressBar;
    targetInfoModifiers!: Panel;


    constructor() { }

    SetContainer(parentContainer: Panel) {
        if (!parentContainer.BLoadLayout(targetInfoXml, true, false)) {
            $.Msg("Couldn't load targetInfoXml.");
            return;
        }
        $.Msg("TargetInfo Container set.");

        this.targetInfoPanel = parentContainer;

        this.targetInfoNameLabel = parentContainer.FindChildTraverse("TargetInfoName") as LabelPanel;
        if (!this.targetInfoNameLabel) {
            $.Msg("Couldn't find TargetInfoName");
            return;
        }
        // Load Healthbar Xml
        const targetInfoHealthbarContainer = parentContainer.FindChildTraverse("TargetInfoHealthBar");
        if ( ! (targetInfoHealthbarContainer && targetInfoHealthbarContainer.BLoadLayout(healthbarInfoXml, true, false))) {
            $.Msg("Couldn't load healthbarInfoXml");
            return;
        }
        this.targetInfoHealthBar = targetInfoHealthbarContainer.FindChildTraverse("ProgressBar") as ProgressBar;
        // Load Manabar Xml
        const targetInfomanabarContainer = parentContainer.FindChildTraverse("TargetInfoManaBar");
        if(!( targetInfomanabarContainer && targetInfomanabarContainer.BLoadLayout(manabarInfoXml, true, false))){
            $.Msg("Couldn't load manabarInfoXml");
            return;
        }
        this.targetInfoManaBar = targetInfomanabarContainer.FindChildTraverse("ProgressBar") as ProgressBar;
        this.targetInfoModifiers = parentContainer.FindChildTraverse("TargetInfoModifiers")!;
        if(!this.targetInfoModifiers){
            $.Msg("Couldn't find targetInfoModifiers");
        }

        this.StartScheduler();
    }

    StartScheduler = () => {
        if (this.scheduler) {
            return;
        }
        this.scheduler = $.Schedule(targetInfoScheduleInterval, this.CheckForTarget);
    }

    StopScheduler = () => {
        if (!this.scheduler) {
            return;
        }
        $.CancelScheduled(this.scheduler);
    }

    private CheckForTarget = () => {
        const target = GetMouseTarget();
        if (target != -1 && !Entities.IsItemPhysical(target)) {
            if (!this.isShowing) {
                this.Show();
            }
            this.Update(target);
        } else {
            if (this.isShowing) {
                this.Hide();
            }
        }
        $.Schedule(targetInfoScheduleInterval, this.CheckForTarget);
    }
    private Show = () => {
        $.Msg("Show TargetInfoPanel");
        this.isShowing = true;
        this.targetInfoPanel.style.visibility = "visible";
    }

    private Hide = () => {
        $.Msg("Hide TargetInfoPanel");
        this.isShowing = false;
        this.targetInfoPanel.style.visibility = "collapse";
    }

    private Update = (target: EntityIndex) => {
        if (!this.IsSameTarget(target)) {
            // Change Name, Boss style and ?Icon
            this.targetInfoNameLabel.text = Entities.GetUnitName(target);
        }
        
        this.targetInfoHealthBar.max = Entities.GetMaxHealth(target);
        this.targetInfoHealthBar.value = Entities.GetHealth(target);

        this.targetInfoManaBar.max = Entities.GetMaxMana(target);
        this.targetInfoManaBar.value = Entities.GetMana(target);

        const buffCount = Entities.GetNumBuffs(target);

        for(let i = 0; i < buffCount; i++){
            const current = Entities.GetBuff(target, buffCount);
            
        }
    }

    private IsSameTarget = (other: EntityIndex) => {
        return this.target === other;
    }
}

GameUI.CustomUIConfig().TargetInfo = new TargetInfo();