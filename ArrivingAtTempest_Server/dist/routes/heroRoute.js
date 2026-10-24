"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroRoute = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.heroRoute = router;
router.get("/api/hero", (req, res) => {
    console.log("recieved get");
    return res.send("Hero get data!");
});
router.post("/api/hero", (req, res) => {
    console.log("recieved post", req.body);
    return res.send("Hero post data!");
});
//# sourceMappingURL=heroRoute.js.map