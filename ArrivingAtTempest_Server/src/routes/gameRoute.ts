import express, { Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { GameProgress } from '../models/gameModel';
import { PlayerService } from '../services/playerService';

const router = express.Router();

router.post("/api/game/init", async (req: Request, res: Response) => {
    console.log("Recieved game init");

    const leanPlayerDocs = await PlayerService.getOrCreatePlayers(req.body.steamIds);
    const gameDocument = await GameService.addNewGame(req.headers.host, leanPlayerDocs);

    return res.send({
        id: gameDocument._id,
        players: leanPlayerDocs.map((playerDocument) => {
            return {
                steamId: playerDocument.steamId,
                premium: playerDocument.premium,
                allowTrade: playerDocument.allowTrade,
                allowPlay: playerDocument.allowPlay
            }
        })
    });
});

router.get("/api/game/start", async (req: Request, res: Response) => {
    console.log("Recieved game start");
    await GameService.updateGameStatus(req.headers.host, req.headers.gameId as string, GameProgress.STARTED);
    return res.sendStatus(200);
});

router.post("/api/game/finish", async (req: Request, res: Response) => {
    console.log("Recieved game finish");
    await GameService.updateGameStatus(req.headers.host, req.headers.gameId as string, GameProgress.FINISHED);
    return res.sendStatus(200);
});

export { router as gameRoute };