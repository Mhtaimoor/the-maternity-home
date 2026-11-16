import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'owner@thematernityhome.pk' },
    update: {},
    create: {
      name: 'Store Owner',
      email: 'owner@thematernityhome.pk',
      passwordHash,
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: 'orders@thematernityhome.pk' },
    update: {},
    create: {
      name: 'Order Staff',
      email: 'orders@thematernityhome.pk',
      passwordHash: await bcrypt.hash('Staff123!', 10),
      role: "ORDER_STAFF",
    },
  });

  const categories = [
    { name: 'Maternity & Postpartum', slug: 'maternity-postpartum', sortOrder: 1 },
    { name: 'Newborn Essentials', slug: 'newborn-essentials', sortOrder: 2 },
    { name: 'Diapers & Hygiene', slug: 'diapers-hygiene', sortOrder: 3 },
    { name: 'Feeding', slug: 'feeding', sortOrder: 4 },
    { name: 'Gifts & Bundles', slug: 'gifts-bundles', sortOrder: 5 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder, active: true },
      create: { ...c, active: true, description: `${c.name} for The Maternity Home` },
    });
  }

  const maternity = await prisma.category.findUniqueOrThrow({ where: { slug: 'maternity-postpartum' } });
  const newborn = await prisma.category.findUniqueOrThrow({ where: { slug: 'newborn-essentials' } });
  const feeding = await prisma.category.findUniqueOrThrow({ where: { slug: 'feeding' } });

  const products = [
    {
      name: 'Maternity Pads — Soft Pack',
      sku: 'TMH-MP-001',
      slug: 'maternity-pads-soft-pack',
      brand: 'The Maternity Home',
      categoryId: maternity.id,
      costPrice: 450,
      sellingPrice: 799,
      salePrice: 699,
      status: "ACTIVE",
      featured: true,
      description: 'Absorbent maternity pads for postpartum care. Pack of 20.',
      variant: { name: 'Pack of 20', sku: 'TMH-MP-001-20', pack: '20', stock: 40 },
    },
    {
      name: 'Newborn Cotton Onesie',
      sku: 'TMH-NO-010',
      slug: 'newborn-cotton-onesie',
      brand: 'The Maternity Home',
      categoryId: newborn.id,
      costPrice: 600,
      sellingPrice: 1290,
      status: "ACTIVE",
      featured: true,
      description: 'Soft breathable cotton onesie for newborns.',
      variant: { name: '0-3 months', sku: 'TMH-NO-010-03', size: '0-3M', stock: 25 },
    },
    {
      name: 'Feeding Bottle 250ml',
      sku: 'TMH-FB-250',
      slug: 'feeding-bottle-250ml',
      brand: 'CareFeed',
      categoryId: feeding.id,
      costPrice: 350,
      sellingPrice: 890,
      status: "ACTIVE",
      featured: false,
      description: 'BPA-free feeding bottle, 250ml capacity.',
      variant: { name: '250ml', sku: 'TMH-FB-250-A', pack: '1', stock: 60 },
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        slug: p.slug,
        brand: p.brand,
        categoryId: p.categoryId,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        salePrice: p.salePrice,
        status: p.status,
        featured: p.featured,
        description: p.description,
        images: {
          create: [
            {
              url: `https://placehold.co/800x800/e8f0ee/1f4e46?text=${encodeURIComponent(p.name.split(' ')[0])}`,
              alt: p.name,
              sortOrder: 0,
            },
          ],
        },
        variants: { create: [p.variant] },
      },
    });
  }

  const cities = [
    { city: 'Lahore', rate: 250, freeAbove: 3500, etaDaysMin: 1, etaDaysMax: 3 },
    { city: 'Islamabad', rate: 300, freeAbove: 4000, etaDaysMin: 2, etaDaysMax: 4 },
    { city: 'Karachi', rate: 350, freeAbove: 4500, etaDaysMin: 3, etaDaysMax: 5 },
    { city: 'Faisalabad', rate: 280, freeAbove: 4000, etaDaysMin: 2, etaDaysMax: 4 },
  ];
  for (const z of cities) {
    await prisma.deliveryZone.upsert({
      where: { city: z.city },
      update: z,
      create: { ...z, active: true, codAvailable: true },
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrder: 1500,
      usageLimit: 1000,
      active: true,
    },
  });

  const pages = [
    {
      slug: 'shipping',
      title: 'Shipping Policy',
      body: 'We deliver across major Pakistani cities. COD available where listed. Delivery fees are calculated at checkout.',
    },
    {
      slug: 'returns',
      title: 'Returns & Exchanges',
      body: 'Unused items in original packaging may be returned within 7 days of delivery, subject to inspection.',
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      body: 'We collect only information needed to fulfil orders. Staff access is role-restricted. Contact us for data requests.',
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      body: 'By placing an order you agree to our pricing, delivery, and return terms as published on this site.',
    },
    {
      slug: 'about',
      title: 'About The Maternity Home',
      body: 'The Maternity Home offers maternity, postpartum, newborn and baby essentials with care-focused service from Lahore.',
    },
    {
      slug: 'faq',
      title: 'FAQ',
      body: 'Q: Do you offer COD?\nA: Yes, in supported cities.\n\nQ: How do I track my order?\nA: Use Track Order with your order number and phone.',
    },
  ];
  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, body: page.body },
      create: page,
    });
  }

  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        title: 'Care for every stage',
        subtitle: 'Maternity to newborn essentials — delivered across Pakistan',
        linkUrl: '/shop',
        sortOrder: 0,
        active: true,
      },
    ],
  });

  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {
      json: JSON.stringify({
        storeName: 'The Maternity Home',
        phone: '+92-300-0000000',
        whatsapp: '+923000000000',
        email: 'hello@thematernityhome.pk',
        currency: 'PKR',
        supportHours: 'Mon–Sat 10:00–18:00',
      }),
    },
    create: {
      id: 'default',
      json: JSON.stringify({
        storeName: 'The Maternity Home',
        phone: '+92-300-0000000',
        whatsapp: '+923000000000',
        email: 'hello@thematernityhome.pk',
        currency: 'PKR',
        supportHours: 'Mon–Sat 10:00–18:00',
      }),
    },
  });

  console.log('Seed complete. Owner login: owner@thematernityhome.pk / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

