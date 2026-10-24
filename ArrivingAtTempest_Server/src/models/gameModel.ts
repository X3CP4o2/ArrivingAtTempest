import { Schema, model, Model, Document } from 'mongoose';
import { PlayerSchema, IPlayerSchema } from './playerModel';

export enum GameProgress {
    LOADING = "loading",
    STARTED = "started",
    FINISHED = "finished",
    TIMEOUT = "timeout"
}

interface IGameSchema {
    date: Date,
    progress: GameProgress,
    host: string,
    players: IPlayerSchema[]
}

interface IGameModel extends Model<GameDocument> {
    build(attr: IGameSchema): GameDocument;
}

interface GameDocument extends Document, IGameSchema {

}

const gameSchema = new Schema({
    date: {
        type: String,
        default: Date.now
    },
    progress: {
        type: GameProgress,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    players: [PlayerSchema]
});

gameSchema.statics.build = (attr: IGameSchema) => {
    return new GameModel(attr);
};

const GameModel = model<GameDocument, IGameModel>('game', gameSchema);

export {GameModel};