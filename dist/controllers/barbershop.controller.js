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
exports.getBarberShopById = exports.createInvite = exports.createBarberShop = void 0;
const prisma_1 = require("../lib/prisma");
const crypto_1 = require("crypto");
const createBarberShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.user.role;
    const userId = req.user.id;
    const { name } = req.body;
    try {
        if (role === 'CLIENT' || role === 'BARBER') {
            return res.status(401).json({ error: 'Você não tem permissão para isso.' });
        }
        ;
        const create = yield prisma_1.prisma.barbershop.create({
            data: {
                name,
                ownerId: userId,
            }
        });
        return res.status(201).json(create);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
    ;
});
exports.createBarberShop = createBarberShop;
const createInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const role = req.user.role;
    const { daysValid } = req.body;
    try {
        if (role === 'CLIENT' || role === 'BARBER') {
            return res.status(401).json({ error: 'Você não tem permissão para isso.' });
        }
        ;
        const code = (0, crypto_1.randomBytes)(5).toString("hex").toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + daysValid);
        const barberShop = yield prisma_1.prisma.barbershop.findFirst({
            where: { ownerId: userId }
        });
        if (!barberShop) {
            return res.status(404).json({ error: "Nenhuma barbearia encontrada para esse usuário." });
        }
        const invite = yield prisma_1.prisma.invite.create({
            data: {
                code,
                expiresAt,
                barbershopId: barberShop.id,
            },
        });
        return res.status(201).json(invite);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.createInvite = createInvite;
const getBarberShopById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRole = req.user.role;
    const { barbershopId } = req.params;
    try {
        if (userRole !== "OWNER") {
            return res.status(401).json({ error: "Sem autorização de acesso." });
        }
        ;
        const barberShop = yield prisma_1.prisma.barbershop.findUnique({
            where: { id: barbershopId },
            select: {
                name: true,
                barbers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
            }
        });
        return res.status(200).json(barberShop);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
    ;
});
exports.getBarberShopById = getBarberShopById;
