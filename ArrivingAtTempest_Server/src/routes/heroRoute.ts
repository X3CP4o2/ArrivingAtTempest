import express, {Request, Response} from 'express';

const router = express.Router();

/**
 * Get a list view all saved heroes having the most important data
 * level, name, difficulty, ?
 */
router.get("/api/hero/previews", (req: Request, res: Response) => {
    console.log("recieved get");
    return res.send("Hero get data!");
});

/**
 * Fully load a players hero
 * TODO: check for dupes in case a save didnt go through and server crashed
 */
router.get("/api/hero/load", (req: Request, res: Response) => {
    console.log("recieved post", req.body);
    return res.send("Hero post data!")
});

/**
 * Fully save a players hero
 */
router.post("/api/hero/save", (req: Request, res: Response) => {
    console.log("recieved post", req.body);
    return res.send("Hero post data!")
});)

export {router as heroRoute};