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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("../lib/jwt");
const prisma_1 = require("../lib/prisma");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, inviteCode } = req.body;
        const hashed = yield (0, bcryptjs_1.hash)(password, 10);
        if (role === 'BARBER') {
            const invite = yield prisma_1.prisma.invite.findUnique({
                where: { code: inviteCode }
            });
            if (!invite)
                throw new Error("Código inválido");
            if (invite.expiresAt < new Date() || invite.expired)
                throw new Error("Convite expirado");
            if (invite.used)
                throw new Error("Convite já utilizado");
            const user = yield prisma_1.prisma.user.create({
                data: { name, email, password: hashed, role, barbershopId: invite.barbershopId },
            });
            yield prisma_1.prisma.invite.update({
                where: { id: invite.id },
                data: { used: true }
            });
            return res.status(201).json(user);
        }
        else {
            const user = yield prisma_1.prisma.user.create({
                data: { name, email, password: hashed, role },
            });
            return res.status(201).json({ message: "Usuário criado", user });
        }
    }
    catch (error) {
        return res.status(400).json({ error: "Erro interno do servidor." });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "Usuário não encontrado" });
        const valid = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!valid)
            return res.status(401).json({ error: "Senha inválida" });
        const token = (0, jwt_1.signToken)({ id: user.id, role: user.role });
        return res.json({ token, user });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.login = login;
