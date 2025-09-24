import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const { serviceId, date } = req.body;

    const conflict = await prisma.booking.findFirst({
      where: { serviceId, date: new Date(date), status: BookingStatus.CONFIRMED },
    });

    if (conflict) {
      return res.status(400).json({ error: "Horário indisponível" });
    };

    const booking = await prisma.booking.create({
      data: {
        clientId,
        serviceId,
        date: new Date(date),
      },
    });

    return res.status(201).json(booking);
  } catch (err: any) {
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
    } else {
      bookings = await prisma.booking.findMany({
        where: { service: { barberId: userId } },
        include: { service: true, client: true },
      });
    }

    return res.json(bookings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
