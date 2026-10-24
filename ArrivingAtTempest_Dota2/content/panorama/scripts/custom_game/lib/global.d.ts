import { CustomGameTableName } from "./../shared/enums";


declare global {
    interface CustomUIConfig {
        CustomGameTables: any;
    }
    
    interface CustomGameEventDeclarations {
        "custom_game_tables": CustomGameEvent_GameTables
    }
    
    interface CustomGameEvent_GameTables {
        delta: boolean | number,
        tables: Record<CustomGameTableName, Record<string, any>>
    }
}
