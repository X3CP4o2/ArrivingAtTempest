import { reloadable } from "./lib/tstl-utils";
import { ServerTablesManager } from './lib/customgametables';
import { RemoteServer } from "./remote/RemoteServer";
import { CustomStats } from './customstats/CustomStats';
import { CustomDamage } from "./customstats/CustomDamage";
import { PropertyNames } from "./shared/stats";
import { Observers } from './lib/Observers';
import { Grid } from "./grid/Grid";
import { RemoteData } from "./remote/RemoteData";

// Modifiers
import "./modifiers/modifier_stats";
import "./modifiers/modifier_cosmetics";
import "./modifiers/modifier_hidehpbar";
// Abilities
import "./modifiers/abilities/modifier_sleep";

import { HideWearables } from "./utils/Wearables";
import { DungeonTile } from './dungeon/DungeonTile';
import { Dungeon } from "./dungeon/Dungeon";

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

const HERO_MAX_LEVEL = 50;
const HERO_XP_TABLE: Record<number, number> = {
    1: 0
};

for (let i = 2; i <= HERO_MAX_LEVEL; i++) {
    HERO_XP_TABLE[i] = HERO_XP_TABLE[i - 1] + (i * 50);
}

const REMOTE_MAX_WAIT_TIME = 60;
const GAME_VERSION = "0";

@reloadable
export class GameMode {

    readonly gameVersion = GAME_VERSION;

    customDamage: CustomDamage;
    worldGrid: Grid;
    hammerEventObservers: Observers<any>;

    remoteData!: RemoteData;

    heroTable = LoadKeyValues("scripts/npc/npc_heroes_custom.txt") as Record<string, Record<string, string>>;
    unitTable = LoadKeyValues("scripts/npc/npc_units_custom.txt") as Record<string, Record<string, string>>;
    itemTable = LoadKeyValues("scripts/npc/npc_items_custom.txt") as Record<string, Record<string, string>>;

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/generic_gameplay/item_received_sparkles.vpcf", context);
        PrecacheResource("particle", "particles/units/lostsiren/lostsiren_feet.vpcf", context);
        PrecacheResource("soundfile", "soundevents/treasures/metal_chest.vsndevts", context);
        PrecacheResource("soundfile", "soundevents/breakables/wooden_chest.vsndevts", context);
        PrecacheResource("soundfile", "soundevents/units/lostsiren.vsndevts", context);
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
    }

    constructor() {

        this.configure();

        this.customDamage = new CustomDamage(GameRules.GetGameModeEntity());
        this.worldGrid = new Grid(Vector(GetWorldMinX() - 32, GetWorldMinY() - 32, 0), Vector(GetWorldMaxX() + 32, GetWorldMaxY() + 32, 0));
        this.hammerEventObservers = new Observers();
        this.remoteData = new RemoteData(RemoteServer);
        
        if(!IsDedicatedServer() && !IsInToolsMode()){
            GameRules.MakeTeamLose(DOTATeam_t.DOTA_TEAM_GOODGUYS);
            return;
        }

        

        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
        ListenToGameEvent("entity_killed", event => this.OnEntityKilled(event), undefined);
        // ListenToGameEvent("player_connect", event => CustomGameTablesManager.onPlayerConnect(event), undefined);
        ListenToGameEvent("player_connect_full", event => ServerTablesManager.onPlayerConnect(event), undefined);
        ListenToGameEvent("player_connect_full", event => {
            const player = EntIndexToHScript(event.userid) as CDOTAPlayer;
            player.SetTeam(DOTATeam_t.DOTA_TEAM_GOODGUYS);
        }, undefined);
        ListenToGameEvent("player_disconnect", event => ServerTablesManager.onPlayerDisconnect(event), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameSetupTimeout(0);
        GameRules.SetCustomGameSetupAutoLaunchDelay(0);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_GOODGUYS, 4);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_BADGUYS, 0);

        GameRules.SetStartingGold(5);
        GameRules.SetGoldTickTime(999999.0)
        GameRules.SetGoldPerTick(0)
        GameRules.SetUseCustomHeroXPValues(true);

        GameRules.SetSameHeroSelectionEnabled(false);
        GameRules.SetUseUniversalShopMode(false);
        GameRules.SetHeroRespawnEnabled(false);
        GameRules.SetShowcaseTime(0);

        GameRules.SetHeroSelectPenaltyTime(0);
        GameRules.SetHeroSelectionTime(0);

        GameRules.SetPreGameTime(0);
        GameRules.SetPostGameTime(0);
        GameRules.SetShowcaseTime(0);
        GameRules.SetStrategyTime(0);

        GameRules.SetCustomGameAllowBattleMusic(false);
        GameRules.SetCustomGameAllowMusicAtGameStart(false);
        GameRules.SetCustomGameAllowHeroPickMusic(false);

        GameRules.SetTreeRegrowTime(0);
        GameRules.SetUseBaseGoldBountyOnHeroes(false);
        GameRules.SetFirstBloodActive(false);
        GameRules.SetHideKillMessageHeaders(true);
        GameRules.LockCustomGameSetupTeamAssignment(true);

        const gamemode = GameRules.GetGameModeEntity();

        gamemode.SetAnnouncerDisabled(true);
        gamemode.SetKillingSpreeAnnouncerDisabled(true);
        gamemode.SetDaynightCycleDisabled(false);
        gamemode.DisableHudFlip(true);
        gamemode.SetDeathOverlayDisabled(true);
        gamemode.SetWeatherEffectsDisabled(false);

        gamemode.SetRecommendedItemsDisabled(true);
        gamemode.SetCameraZRange(11, 10000);
        gamemode.SetCameraDistanceOverride(1701); // DEBUG
        gamemode.SetBuybackEnabled(false);
        gamemode.SetTopBarTeamValuesVisible(false);

        gamemode.SetUseCustomHeroLevels(true);
        gamemode.SetCustomXPRequiredToReachNextLevel(HERO_XP_TABLE);
        gamemode.SetBotThinkingEnabled(false);
        gamemode.SetTowerBackdoorProtectionEnabled(false);
        gamemode.SetFogOfWarDisabled(false); // DEBUG
        gamemode.SetUnseenFogOfWarEnabled(true); // DEBUG
        gamemode.SetGoldSoundDisabled(false);
        gamemode.SetAlwaysShowPlayerInventory(false);
        gamemode.SetLoseGoldOnDeath(false);

        gamemode.SetMinimumAttackSpeed(0);
        gamemode.SetMaximumAttackSpeed(2000);
        gamemode.SetMaxHealth(99999999999999);

        gamemode.SetCustomGameForceHero("npc_dota_hero_dragon_knight");
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();
        print("State: ", state);

        if (state == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
            print("State: Custom Game Setup");
            // this.loadData();
        }

        // Start game once pregame hits
        if (state == DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME) {
            print("State: Pre Game Setup");
            this.StartGame();
        }
    }

    private loadData(): void {
        print("Sending http request...");
        let waited = 0.1;

        // RemoteServer.ping().then(result => print("Ping result: ", result));
        // RemoteServer.post({data: ["Hello", "yo"]}).then( (result: any) => DeepPrintTable(result), rejected => print("post rejected: ", rejected));

        /* DotaPromise.Retry(60, 1, RemoteServer.ping()).then(() => {
            print("Ping success");

            this.remoteData.init();

            Timers.CreateTimer(0.1, () => {
                if (this.remoteData.hasLoaded) {
                    print("Finished loading data");
                    GameRules.FinishCustomGameSetup();
                }
                // TODO: Display timer in frontend and show message when no connection
                if (waited >= REMOTE_MAX_WAIT_TIME) {
                    GameRules.MakeTeamLose(DOTATeam_t.DOTA_TEAM_BADGUYS);
                }
                return 1;
            });

        }, (rejected) => { print("Ping rejected: ", rejected); }); */

        this.remoteData.init();
    }


    private StartGame(): void {
        print("Game starting!");
        // radiant_cavern/entry/1/variation1/bottom
        const dungeonTile = new DungeonTile("radiant_cavern/deadend/1/variation1/bottom", Vector(0, 0, 0), new Dungeon());
        dungeonTile.spawnTile(() => {

            Timers.CreateTimer(1, () => {

                for (let i = 1; i < 6; i++) {
                    const item = CreateItem("item_treasure_chest_" + i, undefined, undefined);
                    const worldItem = CreateItemOnPositionSync(Vector(100 * i, -100, 0), item);
                    worldItem!.SetAngles(0, i * 45, 0);
                   
                }

            });

        });
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");

        // Do some stuff here
    }

    private OnEntityKilled(event: EntityKilledEvent) {
        const attacker = EntIndexToHScript(event.entindex_attacker) as CDOTA_BaseNPC;
        let inflictor: CBaseEntity;
        if (event.entindex_inflictor) {
            inflictor = EntIndexToHScript(event.entindex_inflictor) as CDOTA_BaseNPC;
            print(inflictor!.GetClassname());
        }
        const killed = EntIndexToHScript(event.entindex_killed) as CDOTA_BaseNPC;
        const damage = event.damagebits;

        attacker.OnKill(killed);
        killed.OnDeath(attacker);

        /*       print(attacker!.GetClassname());
              print(killed!.GetClassname()); */
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event

        if (unit.GetClassname() === "npc_dota_thinker" || unit.GetClassname() === "npc_dota_base_additive") {
            return;
        }

        print(unit.GetName(), unit.GetUnitName(), unit.GetClassname());


        if (unit.GetClassname() === "npc_dota_hero_dragon_knight") {
            HideWearables(unit as CDOTA_BaseNPC_Hero);
            Timers.CreateTimer(4, () => {
                // ChangeWearableInSlot(unit as CDOTA_BaseNPC_Hero, "attach_weapon", "models/items/sven/warriors_retribution_lvl3_sven_sword/warriors_retribution_lvl3_sven_sword.vmdl");
                // ChangeWearableInSlot(unit as CDOTA_BaseNPC_Hero, "attach_body", "models/heroes/grimstroke/grimstroke_armor.vmdl");
            });
            unit.AddAbility("lost_siren_sleep");

            Timers.CreateTimer(1, () => {
                print(unit.GetAbsOrigin());
                unit.SetAbsOrigin(Vector(100, 100, 256));
            });
        }

        let name;
        let table;

        unit.Observers = unit.Observers || new Observers();
        unit.CustomData = unit.CustomData || new CustomStats(unit);

        unit.CustomData.addModifiers({
            [PropertyNames.MOVESPEED_FLAT]: 1000,
            "AttackDamagePhysicalMin": 6,
            [PropertyNames.HEALTH_FLAT]: 11,
            [PropertyNames.MANA_FLAT]: 9,
        });


        if (unit.IsRealHero()) {
            name = unit.GetName();
        } else {
            name = unit.GetUnitName();
        }

        if (table != null) {

        }

    }

    ChangeWorldBounds(min: number, max: number) {
        const oldWorldBounds = Entities.FindByClassname(undefined, "world_bounds");
        if (oldWorldBounds) {
            oldWorldBounds.RemoveSelf();
        }

        SpawnEntityFromTableSynchronous("world_bounds", { Min: min, Max: max });

        /* -- Set MiniMap Bounds
        local mapBounds = Entities:FindByClassname(nil, "dota_minimap_boundary")
        if mapBounds then 
            mapBounds:RemoveSelf()
        end

        print("Setting Map Bounds")

        SpawnEntityFromTableSynchronous("dota_minimap_boundary", { origin = minBounds } )
        SpawnEntityFromTableSynchronous("dota_minimap_boundary", { origin = maxBounds } ) 
        */
    }

    GetAllPlayers(){
        const players: CDOTAPlayer[] = [];
        for(let i = 0; i < DOTALimits_t.DOTA_MAX_PLAYERS; i++){
            if(PlayerResource.IsValidPlayer(i)){
                players.push(PlayerResource.GetPlayer(i as PlayerID)!);
            }
        }
        return players;
    }

    GetAllPlayerIds(){
        const playerIds: PlayerID[] = [];
        for(let i = 0; i < DOTALimits_t.DOTA_MAX_PLAYERS; i++){
            if(PlayerResource.IsValidPlayer(i)){
                playerIds.push(i as PlayerID);
            }
        }
        return playerIds;
    }
}
