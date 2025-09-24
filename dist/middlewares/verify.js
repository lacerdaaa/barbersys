"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
const jwt_1 = require("../lib/jwt");
function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token não fornecido" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (_a) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
