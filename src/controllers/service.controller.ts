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

export const listServiceBarbers = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params as { serviceId: string };
    const { barbershopId } = req.query as { barbershopId?: string };

    if (!serviceId || !barbershopId) {
      return res.status(400).json({ error: "serviceId e barbershopId são obrigatórios." });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, barbershopId },
      include: {
        barbers: {
          where: { barbershopId },
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Serviço não encontrado para esta barbearia." });
    }

    return res.status(200).json(service.barbers);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    if (!(req as any)?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    };

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

    const barberShop = await prisma.barbershop.findUnique({
      where: { ownerId: (req as any)?.user.id },
      select: { id: true }
    });

    if (!barberShop) {
      return res.status(404).json({ error: "Barbershop not found" });
    }

    const service = await prisma.service.create({
      data: {
        name,
        price,
        duration,
        barbershopId: barberShop.id,
        barbers: barberIds
          ? { connect: barberIds.map((id: string) => ({ id })) }
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
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
