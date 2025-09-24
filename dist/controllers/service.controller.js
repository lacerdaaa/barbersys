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
exports.listServices = exports.createService = void 0;
const prisma_1 = require("../lib/prisma");
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const barberId = req.user.id;
        const { name, price, duration } = req.body;
        const service = yield prisma_1.prisma.service.create({
            data: { name, price, duration, barberId },
        });
        return res.status(201).json(service);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.createService = createService;
const listServices = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma_1.prisma.service.findMany({
            include: { barber: { select: { id: true, name: true } } },
        });
        return res.json(services);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.listServices = listServices;
