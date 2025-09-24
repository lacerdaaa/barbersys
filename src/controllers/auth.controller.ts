import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { signToken } from "../lib/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, inviteCode } = req.body;
    const hashed = await hash(password, 10);

    if (role === 'BARBER') {
      const invite = await prisma.invite.findUnique({
        where: { code: inviteCode }
      });
      if (!invite) throw new Error("Código inválido");
      if (invite.expiresAt < new Date() || invite.expired) throw new Error("Convite expirado");
      if (invite.used) throw new Error("Convite já utilizado");

      const user = await prisma.user.create({
        data: { name, email, password: hashed, role },
      });

      await prisma.invite.update({
        where: { id: invite.id },
        data: { used: true }
      })

      return res.status(201).json(user)

    } else {
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role },
      });
      return res.status(201).json({ message: "Usuário criado", user });
    }


  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = signToken({ id: user.id, role: user.role });

    return res.json({ token, user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
