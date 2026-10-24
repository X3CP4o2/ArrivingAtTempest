import { GameModel, GameProgress } from '../models/gameModel';
import { IPlayerSchema } from '../models/playerModel';

class Service {


    async addNewGame(host: string, players: IPlayerSchema[]){
        const gameDocument = await GameModel.create({
            progress: GameProgress.LOADING,
            host,
            players
        });

        return await gameDocument.save();
    }

    async updateGameStatus(host: string, gameId: string, progress: GameProgress){
        return GameModel.findByIdAndUpdate(gameId, {
            $in: {
                host
            },
            $set: {
                progress
            }
        });
    }
}

export const GameService = new Service();