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
exports.PlayerService = void 0;
const playerModel_1 = require("../models/playerModel");
class Service {
    getOrCreateData(steamIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const playerDocuments = yield playerModel_1.PlayerModel.find({ 'steamId': {
                    $in: steamIds
                } }).lean();
            const newPlayerDocuments = steamIds.filter((steamId) => {
                for (const playerDocument of playerDocuments) {
                    if (steamId === playerDocument.steamId) {
                        return false;
                    }
                }
                return true;
            }).map((steamId) => {
                return {
                    steamId
                };
            });
            yield playerModel_1.PlayerModel.create(newPlayerDocuments);
            return yield playerModel_1.PlayerModel.find({ 'steamId': {
                    $in: steamIds
                } }).lean();
        });
    }
}
exports.PlayerService = new Service();
//# sourceMappingURL=playerService.js.map