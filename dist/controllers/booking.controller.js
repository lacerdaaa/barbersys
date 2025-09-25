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
exports.updateBookingStatus = exports.listBookings = exports.createBooking = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientId = req.user.id;
        const { serviceId, date } = req.body;
        const conflict = yield prisma_1.prisma.booking.findFirst({
            where: { serviceId, date: new Date(date), status: client_1.BookingStatus.CONFIRMED },
        });
        if (conflict) {
            return res.status(400).json({ error: "Horário indisponível" });
        }
        ;
        const booking = yield prisma_1.prisma.booking.create({
            data: {
                clientId,
                serviceId,
                date: new Date(date),
            },
        });
        return res.status(201).json(booking);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.createBooking = createBooking;
const listBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let bookings;
        if (role === "CLIENT") {
            bookings = yield prisma_1.prisma.booking.findMany({
                where: { clientId: userId },
                include: { service: true },
            });
        }
        else {
            bookings = yield prisma_1.prisma.booking.findMany({
                where: { service: { barberId: userId } },
                include: {
                    service: true,
                    client: {
                        select: {
                            name: true,
                            bookings: {
                                where: {
                                    service: {
                                        barberId: userId
                                    }
                                }
                            },
                        }
                    }
                },
            });
        }
        ;
        return res.json(bookings);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.listBookings = listBookings;
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.user.role;
    const { serviceId } = req.params;
    const { status } = req.body;
    if (role === 'CLIENT') {
        return res.status(401).json({ error: 'Não autorizado.' });
    }
    ;
    try {
        const booking = yield prisma_1.prisma.booking.update({
            where: { id: serviceId },
            data: {
                status: status,
            },
        });
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
    ;
});
exports.updateBookingStatus = updateBookingStatus;
