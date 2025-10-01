import { z } from 'zod';

export const serviceSchema = z.object({
  barberShopId: z.string("ID da barberia é obrigatório"),
  name: z.string("Nome do serviço é obrigatório"),
  price: z.float32("Preço do serviço é obrigatório"),
  duration: z.number(),
  barbersIds: z.array(z.string()),
})

export type serviceSchema = z.infer<typeof serviceSchema>;
