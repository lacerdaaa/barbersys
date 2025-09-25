import express, { NextFunction, RequestHandler } from "express";
import cors from 'cors'
import { prisma } from "./lib/prisma";
import router from "./routes";
import { configDotenv } from "dotenv";
import { loggingMiddleware } from "./middlewares/logger";
import { logger } from "./config/logger";

configDotenv();

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors({
  origin: ["*"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization',]
}));

app.use(loggingMiddleware);
app.use("/api", router);

async function main() {
  try {
    await prisma.$connect();
    logger.info('Prisma connected sucessfully');
    app.listen(port, () => {
      logger.info(`Core service running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  };
};

main();

