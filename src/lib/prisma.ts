import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  prisma.$connect()
} catch (error) {
  process.exit(1)
};

export { prisma };