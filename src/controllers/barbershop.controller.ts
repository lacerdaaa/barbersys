import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { randomBytes } from 'crypto';

export const createBarberShop = async (req: Request, res: Response) => {
  const { name, address, latitude, longitude, phone, description } = req.body;
  const role = (req as any).user.role;
  const userId = (req as any).user.id;
  try {
    if (role === 'CLIENT' || role === 'BARBER') {
      return res.status(401).json({ error: 'Você não tem permissão para isso.' })
    };

    const create = await prisma.barbershop.create({
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
  } catch (error) {
    return res.status(500).json({ error })
  };
};

export const createInvite = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  const { daysValid } = req.body;
  try {
    if (role === 'CLIENT' || role === 'BARBER') {
      return res.status(401).json({ error: 'Você não tem permissão para isso.' })
    };

    const code = randomBytes(5).toString("hex").toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const barberShop = await prisma.barbershop.findFirst({
      where: { ownerId: userId }
    });

    if (!barberShop) {
      return res.status(404).json({ error: "Nenhuma barbearia encontrada para esse usuário." });
    }

    const invite = await prisma.invite.create({
      data: {
        code,
        expiresAt,
        barbershopId: barberShop.id,
      },
    });

    return res.status(201).json(invite);

  } catch (error) {
    return res.status(500).json({ error })
  }
};

export const getBarberShopById = async (req: Request, res: Response) => {
  const userRole = (req as any).user.role;
  const { barbershopId } = req.params;

  try {
    if (userRole !== "OWNER") {
      return res.status(401).json({ error: "Sem autorização de acesso." })
    };

    const barberShop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        description: true,
        services: {
          select: {
            id: true,
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
  } catch (error) {
    return res.status(500).json({ error })
  };
};

export const getMyBarberShop = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    if (role !== 'OWNER') {
      return res.status(401).json({ error: 'Sem autorização de acesso.' });
    }

    const shop = await prisma.barbershop.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        services: {
          select: { id: true, name: true, price: true, duration: true },
        },
        barbers: { select: { id: true, name: true, email: true, role: true } },
        invites: { select: { id: true, code: true, barbershopId: true, expiresAt: true, createdAt: true, expired: true } },
      },
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar sua barbearia.' });
  }
};

export const updateBarberShop = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { barbershopId } = req.params as { barbershopId: string };

    if (role !== 'OWNER') {
      return res.status(401).json({ error: 'Sem autorização de acesso.' });
    }

    const shop = await prisma.barbershop.findUnique({ where: { id: barbershopId }, select: { ownerId: true } });
    if (!shop || shop.ownerId !== userId) {
      return res.status(404).json({ error: 'Barbearia não encontrada.' });
    }

    const { name, address, latitude, longitude, phone, description } = req.body as Partial<{ name: string; address: string; latitude: number; longitude: number; phone: string; description: string }>;

    const updated = await prisma.barbershop.update({
      where: { id: barbershopId },
      data: { name, address, latitude, longitude, phone, description },
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar barbearia.' });
  }
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const getBarberShops = async (req: Request, res: Response) => {
  try {
    const {
      region,
      page = '1',
      limit = '15',
      latitude,
      longitude,
      radius = '15',
      orderBy = 'name',
    } = req.query;
    
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

    const where: Prisma.BarbershopWhereInput = {};

    if (regionQuery && typeof regionQuery === 'string' && regionQuery.trim()) {
      const normalizedRegion = regionQuery.trim();
      where.OR = [
        { address: { contains: normalizedRegion, mode: 'insensitive' } },
        { name: { contains: normalizedRegion, mode: 'insensitive' } },
      ];
    }

    if (shouldFilterByDistance) {
      const latDiff = radiusKm / 111.32; 
      const lngDiff = radiusKm / (111.32 * Math.cos(toRadians(parsedLatitude)) || 1);

      where.AND = [
        { latitude: { not: null } },
        { longitude: { not: null } },
        { latitude: { gte: parsedLatitude - latDiff, lte: parsedLatitude + latDiff } },
        { longitude: { gte: parsedLongitude - lngDiff, lte: parsedLongitude + lngDiff } },
      ];
    }

    const [rows, totalWithoutDistance] = await Promise.all([
      prisma.barbershop.findMany({
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
      prisma.barbershop.count({ where }),
    ]);

    let filtered = rows.map((shop) => {
      if (
        shouldFilterByDistance &&
        typeof shop.latitude === 'number' &&
        typeof shop.longitude === 'number'
      ) {
        const distance = getDistanceInKm(parsedLatitude, parsedLongitude, shop.latitude, shop.longitude);
        return { ...shop, distance };
      }
      return { ...shop, distance: null as number | null };
    });

    if (shouldFilterByDistance) {
      filtered = filtered
        .filter((shop) => typeof shop.distance === 'number' && shop.distance <= radiusKm)
        .sort((a, b) => {
          if (orderBy === 'distance') {
            return (a.distance ?? Infinity) - (b.distance ?? Infinity);
          }
          return (a.name ?? '').localeCompare(b.name ?? '');
        });
    } else if (orderBy === 'name') {
      filtered = filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + pageSize);

    res.setHeader('X-Total-Count', total.toString());
    console.log(paginated)
    return res.status(200).json(paginated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar barbearias.' });
  }
};
