import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const JORDAN_GOVERNORATES = [
  'إربد',
  'عجلون',
  'جرش',
  'المفرق',
  'العاصمة عمّان',
  'البلقاء',
  'الزرقاء',
  'مادبا',
  'الكرك',
  'الطفيلة',
  'معان',
  'العقبة',
];

async function main() {
  const jordan = await prisma.country.findUnique({
    where: { code: 'JO' },
  });

  if (!jordan) {
    console.error('Country Jordan not found');
    process.exit(1);
  }

  // Deactivate all existing cities for Jordan (safer than delete in case of relations)
  await prisma.city.updateMany({
    where: { countryId: jordan.id },
    data: { isActive: false },
  });

  // Create the 12 governorates
  for (let i = 0; i < JORDAN_GOVERNORATES.length; i++) {
    const name = JORDAN_GOVERNORATES[i];
    await prisma.city.upsert({
      where: {
        countryId_name: {
          countryId: jordan.id,
          name,
        },
      },
      update: {
        isActive: true,
        sortOrder: i,
      },
      create: {
        countryId: jordan.id,
        name,
        sortOrder: i,
        isActive: true,
      },
    });
  }

  console.log('Updated Jordan governorates:', JORDAN_GOVERNORATES.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
