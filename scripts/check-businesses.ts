{
  const { prisma } = require('../src/lib/db');

  (async () => {
    const bs = await prisma.business.findMany({
      take: 3,
      include: { User: { select: { email: true, name: true } } },
    });
    console.log(
      JSON.stringify(
        bs.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug, user: b.User?.email })),
        null,
        2
      )
    );
    await prisma.$disconnect();
  })();
}
