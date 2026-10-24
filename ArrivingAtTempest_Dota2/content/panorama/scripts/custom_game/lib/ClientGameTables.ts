/* declare var CustomGameTableNameEnum: import("../shared/enums").CustomGameTableName;
type CustomGameTableName = typeof CustomGameTableNameEnum; */

class ClientGameTables {
    tables: Record<string, Record<string, any>> = {} as any;

    constructor(){
        $.Msg("Subscribing to CustomGameTables");
        /* GameEvents.Subscribe("custom_game_tables", this.updateTables); */
    }

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

    
    getTable = (tableName: string) => {
        return this.tables[tableName];
    }

}

GameUI.CustomUIConfig().CustomGameTables = new ClientGameTables();