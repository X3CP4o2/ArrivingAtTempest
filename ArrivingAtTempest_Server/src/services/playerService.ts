import { IPlayerSchema, PlayerModel } from '../models/playerModel';

class Service {

    async getOrCreatePlayers(steamIds: string[]){
        const playerDocuments = await PlayerModel.find({'steamId': {
            $in: steamIds
        }}).lean();

        const newPlayerDocuments = steamIds.filter( (steamId) => {
            for(const playerDocument of playerDocuments){
                if(steamId === playerDocument.steamId){
                    return false;
                }
            }
            return true;
        }).map<IPlayerSchema>(
            (steamId) => {
                return {
                    steamId
                }
            }
        );

        await PlayerModel.create(newPlayerDocuments);

        return await PlayerModel.find({'steamId': {
            $in: steamIds
        }}).lean();
    }
}

export const PlayerService = new Service();