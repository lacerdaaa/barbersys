import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  };

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; 
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  };
};
