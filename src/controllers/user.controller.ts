import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json(user);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  };
};
