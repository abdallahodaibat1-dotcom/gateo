const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const now = new Date();
(async () => {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        status: 'ACTIVE',
        placement: 'HERO',
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      take: 2,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        business: { select: { id: true, name: true, logo: true } },
      },
    });
    console.log('Ads found:', ads.length);
    console.log(JSON.stringify(ads, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
