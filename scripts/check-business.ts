import { prisma } from '../src/lib/db';

async function main() {
  const b = await prisma.business.findUnique({
    where: { slug: 'rt-lg-health-demo-spa' },
    include: { BusinessTheme: true },
  });
  console.log(JSON.stringify({ name: b?.name, websiteType: b?.websiteType, theme: b?.BusinessTheme }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
