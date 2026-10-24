"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const gameModel_1 = require("../models/gameModel");
class Service {
    addNewGame(host, players) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameDocument = yield gameModel_1.GameModel.create({
                progress: gameModel_1.GameProgress.LOADING,
                host,
                players
            });
            return yield gameDocument.save();
        });
    }
    updateGameStatus(host, gameId, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            return gameModel_1.GameModel.findByIdAndUpdate(gameId, {
                $in: {
                    host
                },
                $set: {
                    progress
                }
            });
        });
    }
}
exports.GameService = new Service();
//# sourceMappingURL=gameService.js.map