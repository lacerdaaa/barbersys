"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceSchema = void 0;
const zod_1 = require("zod");
exports.serviceSchema = zod_1.z.object({
    barberShopId: zod_1.z.string("ID da barberia é obrigatório"),
    name: zod_1.z.string("Nome do serviço é obrigatório"),
    price: zod_1.z.float32("Preço do serviço é obrigatório"),
    duration: zod_1.z.number(),
    barbersIds: zod_1.z.array(zod_1.z.string()),
});
