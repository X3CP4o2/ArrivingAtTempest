import express from 'express';
import { urlencoded, json } from 'body-parser';
import { heroRoute } from './routes/heroRoute';
import { connect } from 'mongoose';
import { infoRoute } from './routes/infoRoute';
import { gameRoute } from './routes/gameRoute';
import { playerRoute } from './routes/playerRoute';

const app = express();
const port = 80;

// app.use(raw());
// app.use(text());

const AUTHORIZATION = "Invalid_NotOnDedicatedServer";

app.use(urlencoded({ extended: true }));
app.use(json());
app.use((request, response, next) => {
    if(!request.headers.authorization || request.headers.authorization !== AUTHORIZATION){
        return response.status(403).send("No authorization set.");
    }
    next();
});
app.use(infoRoute);
app.use(heroRoute);
app.use(gameRoute);
app.use(playerRoute);

connect("mongodb://localhost:27017/arrivalattempest", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, async () => {
    console.log("Conntected to database");
});

app.listen(port, () => {
    console.log("Server is listening on port ", port);
});