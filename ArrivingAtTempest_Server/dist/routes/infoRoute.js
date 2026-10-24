"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoRoute = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.infoRoute = router;
router.get("/api/info/ping", (req, res) => {
    console.log("recieved ping");
    console.log(req.rawHeaders);
    console.log(req.body);
    return res.send("pong");
});
//# sourceMappingURL=infoRoute.js.map