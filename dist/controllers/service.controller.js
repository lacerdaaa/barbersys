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
exports.deleteService = exports.updateService = exports.createService = exports.listServices = void 0;
const prisma_1 = require("../lib/prisma");
const listServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma_1.prisma.service.findMany({
            include: {
                barbershop: {
                    include: {
                        barbers: true
                    }
                }
            },
        });
        return res.json(services);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
    ;
});
exports.listServices = listServices;
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(req === null || req === void 0 ? void 0 : req.user)) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        ;
        const { name, price, duration, barberIds } = req.body;
        if (!name || !price || !duration) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({ error: "Price must be a positive number" });
        }
        if (typeof duration !== "number" || duration <= 0) {
            return res.status(400).json({ error: "Duration must be a positive number" });
        }
        if (barberIds && !Array.isArray(barberIds)) {
            return res.status(400).json({ error: "barberIds must be an array of IDs" });
        }
        const barberShop = yield prisma_1.prisma.barbershop.findUnique({
            where: { ownerId: req === null || req === void 0 ? void 0 : req.user.id },
            select: { id: true }
        });
        if (!barberShop) {
            return res.status(404).json({ error: "Barbershop not found" });
        }
        const service = yield prisma_1.prisma.service.create({
            data: {
                name,
                price,
                duration,
                barbershopId: barberShop.id,
                barbers: barberIds
                    ? { connect: barberIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                barbers: { select: { id: true, name: true, email: true } }
            }
        });
        return res.status(201).json({
            message: "Service created successfully",
            data: service
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.createService = createService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.user.role;
    const { serviceId } = req.params;
    const { name, duration, price } = req.body;
    try {
        if (role === 'CLIENT') {
            return res.status(401).json({ error: 'Você não tem autorização para isto.' });
        }
        ;
        const update = yield prisma_1.prisma.service.update({
            where: { id: serviceId },
            data: {
                name,
                duration,
                price
            },
        });
        return res.status(200).json(update);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
    ;
});
exports.updateService = updateService;
const deleteService = (req, res) => {
    const role = req.user.role;
    const { serviceId } = req.params;
    if (role === 'CLIENT') {
        return res.status(401).json({ error: 'Você não tem autorização para isto.' });
    }
    ;
    try {
        const deleted = prisma_1.prisma.service.delete({
            where: { id: serviceId },
        });
        return res.status(200).json({
            message: `Serviço deletado com sucesso.`
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Erro ao deletar serviço.'
        });
    }
};
exports.deleteService = deleteService;
