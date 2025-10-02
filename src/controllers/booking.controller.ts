import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const { serviceId, barberId, barbershopId, date } = req.body as {
      serviceId?: string;
      barberId?: string;
      barbershopId?: string;
      date?: string;
    };

    if (!serviceId || !barbershopId || !date) {
      return res.status(400).json({ error: "serviceId, barbershopId e date são obrigatórios." });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: "Data inválida." });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        barbers: { select: { id: true, barbershopId: true } },
        barbershop: {
          include: { barbers: { select: { id: true } } }
        },
      },
    });

    if (!service || service.barbershopId !== barbershopId) {
      return res.status(404).json({ error: "Serviço não encontrado para esta barbearia." });
    }

    let resolvedBarberId = barberId ?? null;

    if (resolvedBarberId) {
      const barberExists = await prisma.user.findFirst({
        where: { id: resolvedBarberId, barbershopId },
      });

      if (!barberExists) {
        return res.status(404).json({ error: "Barbeiro não encontrado para esta barbearia." });
      }
      // Se o serviço possui um conjunto específico de barbeiros, validar associação
      if (service.barbers.length > 0 && !service.barbers.some((b) => b.id === resolvedBarberId)) {
        return res.status(400).json({ error: "Este barbeiro não atende este serviço." });
      }
    } else if (service.barbers.length > 0) {
      resolvedBarberId = service.barbers[0].id;
    } else {
      const barbershopBarber = await prisma.user.findFirst({
        where: { barbershopId },
        select: { id: true },
      });

      if (!barbershopBarber) {
        return res.status(400).json({ error: "Nenhum barbeiro disponível para esta barbearia." });
      }

      resolvedBarberId = barbershopBarber.id;
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        barberId: resolvedBarberId,
        date: appointmentDate,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "Horário indisponível para este barbeiro." });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId,
        barbershopId,
        barberId: resolvedBarberId!,
        serviceId,
        date: appointmentDate,
      },
      include: {
        service: true,
        barbershop: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json(booking);
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

export const listBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    let bookings;

    if (role === "CLIENT") {
      bookings = await prisma.booking.findMany({
        where: { clientId: userId },
        include: { service: true },
      });
    };

    if (role === "BARBER") {
      bookings = await prisma.booking.findMany({
        where: { barberId: userId },
        include: { service: true, barbershop: { select: { id: true, name: true } } },
        orderBy: { date: 'asc' },
      });
    };

    if (role === "OWNER") {
      const barbershop = await prisma.barbershop.findFirst({
        where: { ownerId: userId },
        select: { id: true },
      });

      if (!barbershop) {
        return res.status(200).json([]);
      }

      bookings = await prisma.booking.findMany({
        where: { barbershopId: barbershop.id },
        include: {
          service: true,
          barbershop: { select: { id: true, name: true } },
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: 'asc' },
      });
    };
    return res.status(200).json(bookings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const role = (req as any).user.role;
  const { bookingId } = req.params as { bookingId: string };
  const { status } = req.body;

  if (role === 'CLIENT') {
    return res.status(401).json({ error: 'Não autorizado.' })
  };

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status,
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  };
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { barberId, date } = req.query as { barberId?: string; date?: string };
    if (!barberId || !date) {
      return res.status(400).json({ error: "barberId e date são obrigatórios." });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: "Data inválida." });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        barberId,
        date: appointmentDate,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { id: true },
    });

    return res.status(200).json({ available: !conflict });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
