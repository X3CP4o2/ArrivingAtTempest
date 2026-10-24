import express, {Request, Response} from 'express';

const router = express.Router();

router.get("/api/info/ping", (req: Request, res: Response) => {

    console.log("recieved ping");
    console.log(req.rawHeaders);
    console.log(req.body);

    return res.send("pong");
});

export {router as infoRoute};