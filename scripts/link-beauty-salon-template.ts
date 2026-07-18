import { prisma } from '@/lib/db';

async function main() {
  const business = await prisma.business.findFirst({
    where: { slug: 'rt-lg-health-demo-spa' },
    include: { BusinessTheme: true },
  });

  if (!business) {
    console.error('Business not found');
    process.exit(1);
  }

  console.log('Before:', {
    id: business.id,
    name: business.name,
    websiteType: business.websiteType,
    theme: business.BusinessTheme,
  });

  await prisma.businessTheme.upsert({
    where: { businessId: business.id },
    create: {
      businessId: business.id,
      presetId: 'beautySalon',
      primaryColor: '#b76e79',
      secondaryColor: '#c79b6b',
      accentColor: '#d9a1a8',
      backgroundColor: '#fbf7f4',
      surfaceColor: '#ffffff',
      textColor: '#2a1f24',
      fontFamily: 'Tajawal',
      borderRadius: '1.5rem',
      buttonStyle: 'solid',
      heroLayout: 'split',
      navbarStyle: 'fixed',
      homeTemplate: 'beauty-salon',
    },
    update: {
      presetId: 'beautySalon',
      primaryColor: '#b76e79',
      secondaryColor: '#c79b6b',
      accentColor: '#d9a1a8',
      backgroundColor: '#fbf7f4',
      surfaceColor: '#ffffff',
      textColor: '#2a1f24',
      fontFamily: 'Tajawal',
      borderRadius: '1.5rem',
      buttonStyle: 'solid',
      heroLayout: 'split',
      navbarStyle: 'fixed',
      homeTemplate: 'beauty-salon',
    },
  });

  if (business.websiteType !== 'STORE') {
    await prisma.business.update({
      where: { id: business.id },
      data: { websiteType: 'STORE' },
    });
  }

  console.log('Beauty salon template linked to', business.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
