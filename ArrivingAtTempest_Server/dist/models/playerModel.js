"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSchema = exports.PlayerModel = void 0;
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
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
exports.PlayerSchema = playerSchema;
playerSchema.statics.build = (attr) => {
    return new PlayerModel(attr);
};
const PlayerModel = mongoose_1.model('player', playerSchema);
exports.PlayerModel = PlayerModel;
//# sourceMappingURL=playerModel.js.map