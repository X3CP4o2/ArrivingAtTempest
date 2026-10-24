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
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const heroRoute_1 = require("./routes/heroRoute");
const mongoose_1 = require("mongoose");
const infoRoute_1 = require("./routes/infoRoute");
const gameRoute_1 = require("./routes/gameRoute");
const playerRoute_1 = require("./routes/playerRoute");
const app = express_1.default();
const port = 80;
// app.use(raw());
// app.use(text());
const AUTHORIZATION = "Invalid_NotOnDedicatedServer";
app.use(body_parser_1.urlencoded({ extended: true }));
app.use(body_parser_1.json());
app.use((request, response, next) => {
    if (!request.headers.authorization || request.headers.authorization !== AUTHORIZATION) {
        return response.status(403).send("No authorization set.");
    }
    next();
});
app.use(infoRoute_1.infoRoute);
app.use(heroRoute_1.heroRoute);
app.use(gameRoute_1.gameRoute);
app.use(playerRoute_1.playerRoute);
mongoose_1.connect("mongodb://localhost:27017/arrivalattempest", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Conntected to database");
}));
app.listen(port, () => {
    console.log("Server is listening on port ", port);
});
//# sourceMappingURL=index.js.map