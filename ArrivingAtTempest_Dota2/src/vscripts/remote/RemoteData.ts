import { RemoteServer, RouteKey } from './RemoteServer';
import { DotaPromise } from '../utils/DotaPromise';

interface PlayerRemoteData {
    premium: boolean,
    allowTrade: boolean,
    allowPlay: boolean,
    steamId: string,
    playerId: PlayerID
}

export class RemoteData {

    hasLoaded = false;
    players: PlayerRemoteData[] = [];

    constructor(
        private readonly remoteServer: typeof RemoteServer
        ) {}

    init() {
        DotaPromise.Sequence(
            this.callGameInit(),
        ).then(
            () => {
                this.hasLoaded = true;
            },
            (rejected) => {
                print("Init got rejected: ", rejected);
            }
        );
    }

    callGameInit() {
        const playerIds = GameRules.Addon.GetAllPlayerIds();
        const steamIds:string[] = [];

        for(let playerId of playerIds){
            const steamId = tostring(PlayerResource.GetSteamID(playerId));
            steamIds.push(steamId);

            this.updatePlayer({
                steamId: steamId,
                playerId: playerId
            })
        }

        if(steamIds.length < 1){
            return DotaPromise.Resolved(false);
        }

        return new DotaPromise<void, number>((resolve, reject) => {
            this.remoteServer.doCall(RouteKey.GAME_INIT, {steamIds: steamIds}).then((response) => {
                // DeepPrintTable(response);

                this.remoteServer.uniqueGameId = response.id;
                for(let player of response.players){
                    this.updatePlayer(player);
                }

                // DeepPrintTable(this.players);
                resolve();
            }, rejected => reject(rejected));
        });
    }

    private updatePlayer(data: Partial<PlayerRemoteData>){
        let player = ( data.playerId ? this.getPlayerById(data.playerId) : this.getPlayerBySteamId(data.steamId!));

        if(!player){
            player = {} as PlayerRemoteData;
            this.players.push(player);
        }

        player.playerId = data.playerId || player.playerId;
        player.steamId = data.steamId || player.steamId;
        player.premium = data.premium || player.premium || false;
        player.allowTrade = data.allowTrade || player.allowTrade || false;
        player.allowPlay = data.allowPlay || player.allowPlay || false;
    }

    private getPlayerById(playerId: PlayerID){
        return this.players.find( (player) => player.playerId === playerId);
    }

    private getPlayerBySteamId(steamId: string) {
        return this.players.find((player) => player.steamId === steamId);
    }

    GetUniqueGameId(){
        return this.remoteServer.uniqueGameId;
    }
}