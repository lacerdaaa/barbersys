import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { randomBytes } from 'crypto';

export const createBarberShop = async (req: Request, res: Response) => {
  const role = (req as any).user.role;
  const userId = (req as any).user.id;
  const { name } = req.body;
  try {
    if (role === 'CLIENT' || role === 'BARBER') {
      return res.status(401).json({ error: 'Você não tem permissão para isso.' })
    };

    const create = await prisma.barbershop.create({
      data: {
        name,
        ownerId: userId,
      }
    });

    return res.status(201).json(create);
  } catch (error) {
    return res.status(500).json({ error })
  };
};

export const createInvite = async (req: Request, res: Response) => {
  const { barbershopId, daysValid } = req.body;
  try {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const invite = prisma.invite.create({
      data: {
        code,
        barbershopId,
        expiresAt
      }
    });

    return res.status(201).json(invite)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
