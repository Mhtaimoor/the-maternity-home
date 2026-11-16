import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const json = {
    storeName: 'The Maternity Home',
    phone: '+92 3454105452',
    whatsapp: '+923454105452',
    email: 'hello@thematernityhome.pk',
    currency: 'PKR',
    supportHours: 'Mon–Sat 10:00–18:00',
  };
  const row = await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: { json: JSON.stringify(json) },
    create: { id: 'default', json: JSON.stringify(json) },
  });
  console.log('Updated store settings:', JSON.parse(row.json));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
