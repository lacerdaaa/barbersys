import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
  }
};

export const listServices = async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: { barber: { select: { id: true, name: true } } },
    });

    return res.json(services);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
