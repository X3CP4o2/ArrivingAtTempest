export {};

declare global {
    interface CustomUIConfig {
        CustomGameTables: any;
    }
    
    interface CustomGameEventDeclarations {
        "custom_game_tables": CustomGameEvent_GameTables
    }
    
    interface CustomGameEvent_GameTables {
        delta: boolean | number,
        tables: Record<any, Record<string, any>>
    }
}
