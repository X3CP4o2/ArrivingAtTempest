import { CustomGameTableName } from '../enums/enums';

interface CustomGameEventDeclarations {
    "custom_game_tables": CustomGameEvent_GameTables
}

interface CustomGameEvent_GameTables {
    delta: boolean | number,
    tables: Record<CustomGameTableName, Record<string, any>>
}

class _ServerTablesManager {

    playerTables: Record<CustomGameTableName, Record<PlayerID, Record<string, NetTable<CustomGameTableName, any>>>> = {} as any;
    sharedTables: Record<CustomGameTableName, Record<string, NetTable<CustomGameTableName, any>>> = {} as any;

    tableInfo: Record<CustomGameTableName, TableInfo_Shared<CustomGameTableName> | TableInfo_Player<CustomGameTableName>> = {} as any;

    tableNames: CustomGameTableName[] = [];
    playerConntected: Record<number, boolean> = {};

    constructor() {
        print("_ServerTablesManager");
    }

    private getOrCreate<T extends string | number | symbol>(table: Record<T, any>, key: T) {
        if (!table[key]) {
            table[key] = {};
        }
        return table[key];
    }

    createTable<R extends CustomGameTableName, T>(info: TableInfo_Shared<R> | TableInfo_Player<R>, data?: T, filter?: (data: T) => T): NetTable<R, T> {
        this.tableInfo[info.type] = info;
        this.tableNames.push(info.type);

        const table = data ? new NetTable<R, T>(info, this, data, filter) : new NetTable<R, T>(info, this);

        if ((<TableInfo_Shared<R>>info).shared !== undefined) {
            this.getOrCreate(this.sharedTables, info.type)[info.identifier] = table;
        } else {
            const playerId = (<TableInfo_Player<R>>info).playerId;

            const typeRecord = this.getOrCreate(this.playerTables, info.type);
            this.getOrCreate(typeRecord, playerId)[info.identifier] = table;
        }
        if (data) {
            table.flush(false);
        }
        return table;
    }

    getPlayerTable<R extends CustomGameTableName, T>(tableType: R, tableIdentifier: string, playerId: PlayerID): NetTable<R, T> {
        return this.playerTables[tableType][playerId][tableIdentifier];
    }

    onPlayerConnect(event: GameEventProvidedProperties & PlayerConnectFullEvent) {
        print("Player " + event.userid + " connected");
        const player = EntIndexToHScript(event.userid) as CDOTAPlayer;
        this.playerConntected[player.GetPlayerID()] = true;
        this.sendAllTablesToPlayer(player);
    }

    onPlayerDisconnect(event: GameEventProvidedProperties & PlayerDisconnectEvent) {
        const playerIndex = event.PlayerID;
        this.playerConntected[playerIndex] = false;
    }

    private sendAllTablesToPlayer(player: CDOTAPlayer) {
        let data: Record<CustomGameTableName, Record<string, Record<string, any>>> = {} as any;
        const playerId = player.GetPlayerID();

        for (let tableType in this.sharedTables) {
            const tableData: Record<string, Record<string, any>> = {};
            const sharedIdentifierTable = this.sharedTables[tableType as CustomGameTableName];

            for (let tableIdentifier in sharedIdentifierTable) {
                tableData[tableIdentifier] = sharedIdentifierTable[tableIdentifier].getWithDelta();
            }

            data[tableType as CustomGameTableName] = tableData;
        }

        for (let tableType in this.playerTables) {
            const tableData: Record<string, Record<string, any>> = {};
            const playerIdentifierTable = this.playerTables[tableType as CustomGameTableName][playerId];

            for (let tableIdentifier in playerIdentifierTable) {
                tableData[tableIdentifier] = playerIdentifierTable[tableIdentifier].getWithDelta();
            }

            data[tableType as CustomGameTableName] = tableData;
        }

        CustomGameEventManager.Send_ServerToPlayer(player, "custom_game_tables", this.constructTransferData(data, false));
    }

    private constructTransferData(tables: Record<string, any>, delta: boolean): never {
        return <never>{
            delta: delta,
            tables: tables
        }
    }

    public broadcastSharedTable<T>(tableType: CustomGameTableName, tableIdentifier: string, delta = true, useFilter = true) {
        const table = this.sharedTables[tableType][tableIdentifier];
        if (table == null) {
            print(tableType + " is no shared table");
            return;
        }
        if (!delta) {
            table.applyDelta();
        }
        const data = {
            [tableType]: {
                [tableIdentifier]: delta ? table.getDelta(useFilter) : table.getData(useFilter)
            }
        }
        CustomGameEventManager.Send_ServerToAllClients("custom_game_tables", this.constructTransferData(data, delta));
        if (delta) {
            table.applyDelta();
        }
    }

    public sendTableToPlayer<T extends CustomGameTableName>(tableType: T, tableIdentifier: string, player: CDOTAPlayer, delta = true, useFilter = true) {
        const playerId = player.GetPlayerID();
        const table = this.playerTables[tableType][playerId][tableIdentifier];

        if (table == null) {
            print(tableType + " is no player table");
            return;
        }

        if (!delta) {
            table.applyDelta();
        }
        const data = {
            [tableType]: {
                [tableIdentifier]: delta ? table.getDelta(useFilter) : table.getData(useFilter)
            }
        }
        CustomGameEventManager.Send_ServerToPlayer(player, "custom_game_tables", this.constructTransferData(data, delta));
        if (delta) {
            table.applyDelta();
        }
    }

}

type TableInfo<T extends CustomGameTableName> = {
    type: T;
    identifier: string;
}

type TableInfo_Shared<T extends CustomGameTableName> = {
    shared: boolean;
} & TableInfo<T>

type TableInfo_Player<T extends CustomGameTableName> = {
    playerId: PlayerID;
} & TableInfo<T>


export class NetTable<R extends CustomGameTableName, T> {

    private data: T;
    private delta: T = <T>{};
    private tableManager: _ServerTablesManager;
    private type: CustomGameTableName;
    private isShared!: boolean;
    private player!: CDOTAPlayer;
    private identifier: string;

    constructor(tableInfo: TableInfo_Player<R> | TableInfo_Shared<R>, tableManager: _ServerTablesManager, data?: T, private filter = (data: T) => data) {
        this.type = tableInfo.type;
        this.identifier = tableInfo.identifier;

        if ((<TableInfo_Shared<R>>tableInfo).shared !== undefined) {
            this.isShared = true;
        } else {
            this.player = PlayerResource.GetPlayer((<TableInfo_Player<R>>tableInfo).playerId)!;
        }
        this.tableManager = tableManager;
        this.data = data ? data : <T>{};
    }

    getData(useFilter = false) {
        return useFilter ? this.filter(this.data) : this.data;
    }

    getDelta(useFilter = false) {
        return useFilter ? this.filter(this.delta) : this.delta;
    }

    getWithDelta(useFilter = false) {
        const data = Object.assign(this.data, this.delta);
        return useFilter ? this.filter(data) : data;
    }

    setValue(key: keyof T, value: any) {
        this.delta[key] = value;
    }

    getValue(key: keyof T): T[keyof T] {
        return this.delta[key] || this.data[key];
    }

    hasDelta() {
        return this.delta != {};
    }

    applyDelta() {
        if (!this.hasDelta()) {
            return;
        }
        this.data = Object.assign(this.data, this.delta);
        this.clear();
        this.delta = <T>{};
    }

    flush(delta = true, useFilter = true) {
        if (this.isShared) {
            this.tableManager.broadcastSharedTable(this.type, this.identifier, delta, useFilter);
        } else {
            this.tableManager.sendTableToPlayer(this.type, this.identifier, this.player, delta, useFilter);
        }
    }

    private clear() {
        for (let key in this.data) {
            if (this.data[key] == null) {
                delete this.data[key];
            }
        }
    }
}

export const ServerTablesManager = new _ServerTablesManager();