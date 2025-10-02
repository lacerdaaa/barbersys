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
  } catch (error) {
    return res.status(500).json({ error })
  };
};

export const getBarberShops = async (req: Request, res: Response) => {
  try {
    const { region, page = '1', limit = '15' } = req.query;

    const parsedPage = Number(Array.isArray(page) ? page[0] : page);
    const parsedLimit = Number(Array.isArray(limit) ? limit[0] : limit);

    const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
    const pageSize = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 50) : 15;
    const skip = (currentPage - 1) * pageSize;

    const regionQuery = Array.isArray(region) ? region[0] : region;

    const where: Prisma.BarbershopWhereInput = {};

    if (regionQuery && typeof regionQuery === 'string' && regionQuery.trim()) {
      const normalizedRegion = regionQuery.trim();
      where.OR = [
        { address: { contains: normalizedRegion, mode: 'insensitive' } },
        { name: { contains: normalizedRegion, mode: 'insensitive' } },
      ];
    }

    const [barbershops, total] = await Promise.all([
      prisma.barbershop.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
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

    res.setHeader('X-Total-Count', total.toString());

    return res.status(200).json(barbershops);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar barbearias.' });
  }
};
