import express, {Request, Response} from 'express';
import { PlayerService } from '../services/playerService';


const router = express.Router();

router.post("/api/player/find", async (req: Request, res: Response) => {
    res.sendStatus(200);
});

export {router as playerRoute};