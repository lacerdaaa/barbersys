import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const { serviceId, barberId, barbershopId, date } = req.body;

    const conflict = await prisma.booking.findFirst({
      where: { serviceId, date: new Date(date), status: BookingStatus.CONFIRMED },
    });

    if (conflict) {
      return res.status(400).json({ error: "Horário indisponível" });
    };

    const booking = await prisma.booking.create({
      data: {
        clientId,
        barbershopId,
        barberId,
        serviceId,
        date: new Date(date),
      },
    });

    return res.status(201).json(booking);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
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
        where: {
          barberId: role,
        }
      });
    };

    if (role === "OWNER") {
      bookings = await prisma.booking.findMany()
    };
    return res.status(200).json(bookings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const role = (req as any).user.role;
  const { serviceId } = req.params;
  const { status } = req.body;

  if (role === 'CLIENT') {
    return res.status(401).json({ error: 'Não autorizado.' })
  };

  try {
    const booking = await prisma.booking.update({
      where: { id: serviceId },
      data: {
        status: status,
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  };
};

