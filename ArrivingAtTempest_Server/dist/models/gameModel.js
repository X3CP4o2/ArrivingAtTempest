"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = exports.GameProgress = void 0;
const mongoose_1 = require("mongoose");
const playerModel_1 = require("./playerModel");
var GameProgress;
(function (GameProgress) {
    GameProgress["LOADING"] = "loading";
    GameProgress["STARTED"] = "started";
    GameProgress["FINISHED"] = "finished";
    GameProgress["TIMEOUT"] = "timeout";
})(GameProgress = exports.GameProgress || (exports.GameProgress = {}));
const gameSchema = new mongoose_1.Schema({
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
    players: [playerModel_1.PlayerSchema]
});
gameSchema.statics.build = (attr) => {
    return new GameModel(attr);
};
const GameModel = mongoose_1.model('game', gameSchema);
exports.GameModel = GameModel;
//# sourceMappingURL=gameModel.js.map