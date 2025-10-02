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
exports.getBarberShops = exports.getBarberShopById = exports.createInvite = exports.createBarberShop = void 0;
const prisma_1 = require("../lib/prisma");
const crypto_1 = require("crypto");
const createBarberShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, latitude, longitude, phone, description } = req.body;
    const role = req.user.role;
    const userId = req.user.id;
    try {
        if (role === 'CLIENT' || role === 'BARBER') {
            return res.status(401).json({ error: 'Você não tem permissão para isso.' });
        }
        ;
        const create = yield prisma_1.prisma.barbershop.create({
            data: {
                name,
                ownerId: userId,
                address,
                latitude,
                longitude,
                phone,
                description
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
                services: {
                    select: {
                        name: true,
                        price: true,
                        duration: true,
                        barbers: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                    }
                },
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
const EARTH_RADIUS_KM = 6371;
const toRadians = (value) => (value * Math.PI) / 180;
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};
const getBarberShops = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { region, page = '1', limit = '15', latitude, longitude, radius = '15', orderBy = 'name', } = req.query;
        const parsedPage = Number(Array.isArray(page) ? page[0] : page);
        const parsedLimit = Number(Array.isArray(limit) ? limit[0] : limit);
        const parsedLatitude = Number(Array.isArray(latitude) ? latitude[0] : latitude);
        const parsedLongitude = Number(Array.isArray(longitude) ? longitude[0] : longitude);
        const parsedRadius = Number(Array.isArray(radius) ? radius[0] : radius);
        const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
        const pageSize = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 50) : 15;
        const skip = (currentPage - 1) * pageSize;
        const regionQuery = Array.isArray(region) ? region[0] : region;
        const shouldFilterByDistance = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
        const radiusKm = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 15;
        const where = {};
        if (regionQuery && typeof regionQuery === 'string' && regionQuery.trim()) {
            const normalizedRegion = regionQuery.trim();
            where.OR = [
                { address: { contains: normalizedRegion, mode: 'insensitive' } },
                { name: { contains: normalizedRegion, mode: 'insensitive' } },
            ];
        }
        if (shouldFilterByDistance) {
            const latDiff = radiusKm / 111.32; // approx degrees per km
            const lngDiff = radiusKm / (111.32 * Math.cos(toRadians(parsedLatitude)) || 1);
            where.AND = [
                { latitude: { not: null } },
                { longitude: { not: null } },
                { latitude: { gte: parsedLatitude - latDiff, lte: parsedLatitude + latDiff } },
                { longitude: { gte: parsedLongitude - lngDiff, lte: parsedLongitude + lngDiff } },
            ];
        }
        const [rows, totalWithoutDistance] = yield Promise.all([
            prisma_1.prisma.barbershop.findMany({
                where,
                orderBy: orderBy === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
                include: {
                    services: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            duration: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.barbershop.count({ where }),
        ]);
        let filtered = rows.map((shop) => {
            if (shouldFilterByDistance &&
                typeof shop.latitude === 'number' &&
                typeof shop.longitude === 'number') {
                const distance = getDistanceInKm(parsedLatitude, parsedLongitude, shop.latitude, shop.longitude);
                return Object.assign(Object.assign({}, shop), { distance });
            }
            return Object.assign(Object.assign({}, shop), { distance: null });
        });
        if (shouldFilterByDistance) {
            filtered = filtered
                .filter((shop) => typeof shop.distance === 'number' && shop.distance <= radiusKm)
                .sort((a, b) => {
                var _a, _b, _c, _d;
                if (orderBy === 'distance') {
                    return ((_a = a.distance) !== null && _a !== void 0 ? _a : Infinity) - ((_b = b.distance) !== null && _b !== void 0 ? _b : Infinity);
                }
                return ((_c = a.name) !== null && _c !== void 0 ? _c : '').localeCompare((_d = b.name) !== null && _d !== void 0 ? _d : '');
            });
        }
        else if (orderBy === 'name') {
            filtered = filtered.sort((a, b) => { var _a, _b; return ((_a = a.name) !== null && _a !== void 0 ? _a : '').localeCompare((_b = b.name) !== null && _b !== void 0 ? _b : ''); });
        }
        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + pageSize);
        res.setHeader('X-Total-Count', total.toString());
        return res.status(200).json(paginated);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao listar barbearias.' });
    }
});
exports.getBarberShops = getBarberShops;
