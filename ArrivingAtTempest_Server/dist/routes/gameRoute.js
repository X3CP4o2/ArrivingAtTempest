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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRoute = void 0;
const express_1 = __importDefault(require("express"));
const gameService_1 = require("../services/gameService");
const gameModel_1 = require("../models/gameModel");
const playerService_1 = require("../services/playerService");
const router = express_1.default.Router();
exports.gameRoute = router;
router.post("/api/game/init", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Recieved game init");
    const playerDocuments = yield playerService_1.PlayerService.getOrCreateData(req.body.steamIds);
    const gameDocument = yield gameService_1.GameService.addNewGame(req.headers.host, playerDocuments);
    return res.send({
        id: gameDocument._id,
        players: playerDocuments.map((playerDocument) => {
            return {
                steamId: playerDocument.steamId,
                premium: playerDocument.premium,
                allowTrade: playerDocument.allowTrade,
                allowPlay: playerDocument.allowPlay
            };
        })
    });
}));
router.get("/api/game/start", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Recieved game start");
    yield gameService_1.GameService.updateGameStatus(req.headers.host, req.headers.gameId, gameModel_1.GameProgress.STARTED);
    return res.sendStatus(200);
}));
router.post("/api/game/finish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Recieved game finish");
    yield gameService_1.GameService.updateGameStatus(req.headers.host, req.headers.gameId, gameModel_1.GameProgress.FINISHED);
    return res.sendStatus(200);
}));
//# sourceMappingURL=gameRoute.js.map