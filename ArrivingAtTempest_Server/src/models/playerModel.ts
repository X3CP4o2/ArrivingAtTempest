import { Schema, model, Model, Document } from 'mongoose';

export interface IPlayerSchema {
    steamId: string;
    playerName?: string;
    premium?: boolean;
    allowTrade?: boolean;
    allowPlay?: boolean;
}

interface IPlayerModel extends Model<PlayerDocument> {
    build(attr: IPlayerSchema): PlayerDocument;
}

interface PlayerDocument extends Document, IPlayerSchema {

}

const playerSchema = new Schema({
    steamId: {
        type: String,
        required: true
    },
    playerName: {
        type: String,
        required: false
    },
    premium: {
        type: Boolean,
        default: false
    },
    allowTrade: {
        type: Boolean,
        default: true
    },
    allowPlay: {
        type: Boolean,
        default: true
    }
});

playerSchema.statics.build = (attr: IPlayerSchema) => {
    return new PlayerModel(attr);
};

const PlayerModel = model<PlayerDocument, IPlayerModel>('player', playerSchema);

export {PlayerModel};
export {playerSchema as PlayerSchema};