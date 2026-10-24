"use strict";
/* declare var CustomGameTableNameEnum: import("../shared/enums").CustomGameTableName;
type CustomGameTableName = typeof CustomGameTableNameEnum; */
class ClientGameTables {
    constructor() {
        this.tables = {};
        /* updateTables = (event: CustomGameEvent_GameTables) => {
            $.Msg("Recieved table updates", event);
    
            for(let tableType in event.tables){
                if(event.delta){
                    this.tables[tableType] = Object.assign(this.tables[tableType] || {}, event.tables[tableType]);
                } else {
                    this.tables[tableType] = event.tables[tableType];
                }
            }
        } */
        this.getTable = (tableName) => {
            return this.tables[tableName];
        };
        $.Msg("Subscribing to CustomGameTables");
        /* GameEvents.Subscribe("custom_game_tables", this.updateTables); */
    }
}
GameUI.CustomUIConfig().CustomGameTables = new ClientGameTables();
