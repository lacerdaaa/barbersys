import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const listServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: { barber: { select: { id: true, name: true } } },
    });

    return res.json(services);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};

export const createService = async (req: Request, res: Response) => {
  try {
    const barberId = (req as any).user.id;
    const { name, price, duration } = req.body;

    const service = await prisma.service.create({
      data: { name, price, duration, barberId },
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
