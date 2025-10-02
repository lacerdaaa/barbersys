import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import { hash} from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from './lib/prisma';


const BASE_BARBERSHOPS = [
  { city: 'São Paulo - SP', latitude: -23.55052, longitude: -46.63331 },
  { city: 'Rio de Janeiro - RJ', latitude: -22.90685, longitude: -43.1729 },
  { city: 'Belo Horizonte - MG', latitude: -19.91668, longitude: -43.93449 },
  { city: 'Curitiba - PR', latitude: -25.42836, longitude: -49.27325 },
  { city: 'Porto Alegre - RS', latitude: -30.03465, longitude: -51.21766 },
  { city: 'Salvador - BA', latitude: -12.97775, longitude: -38.50163 },
  { city: 'Fortaleza - CE', latitude: -3.73186, longitude: -38.52667 },
  { city: 'Recife - PE', latitude: -8.04756, longitude: -34.877 },
  { city: 'Campinas - SP', latitude: -22.90994, longitude: -47.06263 },
  { city: 'Florianópolis - SC', latitude: -27.59538, longitude: -48.54805 },
  { city: 'Goiânia - GO', latitude: -16.6869, longitude: -49.2648 },
  { city: 'Manaus - AM', latitude: -3.11903, longitude: -60.02173 },
];

const BARBERSHOP_PREFIXES = ['Studio', 'Oficina', 'Barber', 'Estilo', 'Clube', 'Corte', 'Elite', 'Barbearia'];
const BARBERSHOP_SUFFIXES = ['Prime', 'Premium', 'Central', 'Do Centro', 'Moderna', 'da Cidade', 'do Bairro', 'Urban'];
const SERVICE_NAMES = ['Corte Masculino', 'Barba Completa', 'Corte + Barba', 'Pintura', 'Tratamento Capilar', 'Massagem Relaxante'];
const BARBER_NAMES = ['João', 'Pedro', 'Carlos', 'Lucas', 'Tiago', 'Rafael', 'Igor', 'Marcelo'];
const CLIENT_NAMES = ['André', 'Bruno', 'Caio', 'Daniel', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Ivan', 'Jorge', 'Leonardo', 'Marcos'];

const BARBERS_PER_SHOP = Number(process.env.SEED_BARBERS_PER_SHOP ?? 3);
const BOOKINGS_PER_SHOP = Number(process.env.SEED_BOOKINGS_PER_SHOP ?? 10);
const INVITES_PER_SHOP = Number(process.env.SEED_INVITES_PER_SHOP ?? 5);
const SHOPS_PER_CITY = Number(process.env.SEED_SHOPS_PER_CITY ?? 8);
const EXTRA_CLIENTS = Number(process.env.SEED_EXTRA_CLIENTS ?? 150);

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const randomCoordinate = (base: number) => base + randomBetween(-0.08, 0.08);

const buildBarbershopName = () => {
  const prefix = BARBERSHOP_PREFIXES[Math.floor(Math.random() * BARBERSHOP_PREFIXES.length)];
  const suffix = BARBERSHOP_SUFFIXES[Math.floor(Math.random() * BARBERSHOP_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
};

const buildPhone = () => {
  const ddd = Math.floor(randomBetween(11, 99));
  const part1 = Math.floor(randomBetween(90000, 99999));
  const part2 = Math.floor(randomBetween(1000, 9999));
  return `(${ddd}) ${part1}-${part2}`;
};

const buildAddress = (city: string) => {
  const streets = ['Rua das Flores', 'Avenida Paulista', 'Rua XV de Novembro', 'Rua das Palmeiras', 'Avenida Central', 'Rua das Acácias'];
  const numbers = Math.floor(randomBetween(10, 999));
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${street}, ${numbers} - ${city}`;
};

const buildServices = async (barbershopId: string) => {
  const servicesToCreate = SERVICE_NAMES.slice(0, Math.floor(randomBetween(3, SERVICE_NAMES.length + 1)));
  const created = [];
  for (const [index, name] of servicesToCreate.entries()) {
    const service = await prisma.service.create({
      data: {
        barbershopId,
        name,
        price: Number(randomBetween(30, 150).toFixed(2)),
        duration: 20 + index * 10,
      },
    });
    created.push(service);
  }
  return created;
};

const buildInvite = (barbershopId: string) => ({
  code: randomBytes(5).toString('hex').toUpperCase(),
  barbershopId,
  expiresAt: new Date(Date.now() + randomBetween(7, 60) * 24 * 60 * 60 * 1000),
});

const buildBookingDate = () => {
  const daysAhead = Math.floor(randomBetween(1, 45));
  const hours = [9, 10, 11, 12, 13, 14, 15, 16];
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hours[Math.floor(Math.random() * hours.length)], 0, 0, 0);
  return date;
};

async function seed() {
  const passwordHash = await hash('123456', 10);

  console.log('🧹 Limpando dados anteriores...');
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.barbershop.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Criando clientes de teste...');
  const clients: string[] = [];
  for (let i = 1; i <= EXTRA_CLIENTS; i += 1) {
    const client = await prisma.user.create({
      data: {
        name: `${CLIENT_NAMES[i % CLIENT_NAMES.length]} Cliente ${i}`,
        email: `client${i}@seed.findcut`,
        password: passwordHash,
        role: Role.CLIENT,
      },
    });
    clients.push(client.id);
  }

  console.log('🌱 Inserindo barbearias, barbeiros e agendamentos...');

  let shopCounter = 0;
  const bookingStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELED];

  for (const base of BASE_BARBERSHOPS) {
    for (let shopIndex = 0; shopIndex < SHOPS_PER_CITY; shopIndex += 1) {
      shopCounter += 1;
      const owner = await prisma.user.create({
        data: {
          name: `Owner Seed ${shopCounter}`,
          email: `owner${shopCounter}@seed.findcut`,
          password: passwordHash,
          role: Role.OWNER,
        },
      });

      const barbershop = await prisma.barbershop.create({
        data: {
          name: buildBarbershopName(),
          ownerId: owner.id,
          address: buildAddress(base.city),
          latitude: Number(randomCoordinate(base.latitude).toFixed(6)),
          longitude: Number(randomCoordinate(base.longitude).toFixed(6)),
          phone: buildPhone(),
          description: 'Barbearia criada para testes automáticos do ambiente de desenvolvimento.',
        },
      });

      const services = await buildServices(barbershop.id);

      const barbers: string[] = [];
      for (let barberIndex = 0; barberIndex < BARBERS_PER_SHOP; barberIndex += 1) {
        const barber = await prisma.user.create({
          data: {
            name: `${BARBER_NAMES[(barberIndex + shopCounter) % BARBER_NAMES.length]} ${shopCounter}-${barberIndex + 1}`,
            email: `barber${shopCounter}_${barberIndex + 1}@seed.findcut`,
            password: passwordHash,
            role: Role.BARBER,
            barbershopId: barbershop.id,
          },
        });
        barbers.push(barber.id);
      }

      for (let inviteIndex = 0; inviteIndex < INVITES_PER_SHOP; inviteIndex += 1) {
        await prisma.invite.create({ data: buildInvite(barbershop.id) });
      }

      for (let bookingIndex = 0; bookingIndex < BOOKINGS_PER_SHOP; bookingIndex += 1) {
        const service = services[Math.floor(Math.random() * services.length)];
        const barberId = barbers[Math.floor(Math.random() * barbers.length)];
        const clientId = clients[Math.floor(Math.random() * clients.length)];
        const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

        await prisma.booking.create({
          data: {
            clientId,
            barberId,
            serviceId: service.id,
            barbershopId: barbershop.id,
            date: buildBookingDate(),
            status,
          },
        });
      }
    }
  }

  console.log(`✅ Seed concluído com sucesso. Foram criadas ${shopCounter} barbearias, ${clients.length} clientes e centenas de serviços e agendamentos. Usuários gerados usam a senha padrão 123456.`);
}

seed()
  .catch((error) => {
    console.error('Erro ao executar seed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
