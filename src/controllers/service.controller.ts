import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { serviceSchema } from "../models/services";

export const listServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        barbershop: {
          include: {
            barbers: true
          }
        }
      },
    });

    return res.json(services);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};

export const createService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const parsed = serviceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(403).json({ error: parsed.error.message });
    }
    const data = parsed.data;

    const barberShop = await prisma.barbershop.findUniqueOrThrow({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
      }
    });

    const service = await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
        barbershopId: barberShop.id,
      },
    });

    return res.status(201).json(service);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};

export const updateService = async (req: Request, res: Response) => {
  const role = (req as any).user.role;
  const { serviceId } = req.params;
  const { name, duration, price } = req.body;

  try {
    if (role === 'CLIENT') {
      return res.status(401).json({ error: 'Você não tem autorização para isto.' })
    };

    const update = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        duration,
        price
      },
    });

    return res.status(200).json(update);
  } catch (error) {
    return res.status(500).json({ error })
  };
};

export const deleteService = (req: Request, res: Response) => {
  const role = (req as any).user.role;
  const { serviceId } = req.params;

  if (role === 'CLIENT') {
    return res.status(401).json({ error: 'Você não tem autorização para isto.' });
  };

  try {
    const deleted = prisma.service.delete({
      where: { id: serviceId },
    });

    return res.status(200).json({
      message: `Serviço deletado com sucesso.`
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao deletar serviço.'
    });
  }
};
