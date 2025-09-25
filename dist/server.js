"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./lib/prisma");
const routes_1 = __importDefault(require("./routes"));
const dotenv_1 = require("dotenv");
const logger_1 = require("./middlewares/logger");
const logger_2 = require("./config/logger");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["*"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization',]
}));
app.use(logger_1.loggingMiddleware);
app.use("/api", routes_1.default);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_1.prisma.$connect();
            logger_2.logger.info('Prisma connected sucessfully');
            app.listen(port, () => {
                logger_2.logger.info(`Core service running on port ${port}`);
            });
        }
        catch (error) {
            console.error(error);
        }
        ;
    });
}
;
main();
