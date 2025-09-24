import express from "express";
import cors from 'cors'
import { prisma } from "./lib/prisma";
import router from "./routes";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors({
  origin: ["*"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization',]
}));

app.use("/api", router)

async function main() {
  try {
    await prisma.$connect();
    console.log('Prisma connected sucessfully');
    app.listen(port, () => {
      console.log(`Core service running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  };
};

main();

