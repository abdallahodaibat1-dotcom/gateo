{
  const { prisma } = require('../src/lib/db');

  const USER_ID = 'cmr5g61oe00ae7vhzlb3famwb';
  const BUSINESS_ID = 'cmr5g6oe600an7vhz6akudpaw';

  async function main() {
    await prisma.$transaction(async (tx: any) => {
      await tx.businessTheme.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.businessPage.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.service.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.product.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.businessAsset.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.aiGenerationJob.deleteMany({ where: { businessId: { startsWith: BUSINESS_ID } } });
      await tx.aiGenerationJob.deleteMany({ where: { businessId: 'pending', userId: USER_ID } });
      await tx.review.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.businessSubcategory.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.businessFieldValue.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.booking.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.invoice.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.commission.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.ad.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.post.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.businessSubscription.deleteMany({ where: { businessId: BUSINESS_ID } });
      await tx.business.delete({ where: { id: BUSINESS_ID } });
    });
    console.log('Business deleted:', BUSINESS_ID);
    await prisma.$disconnect();
  }

  main().catch((e: any) => { console.error(e); process.exit(1); });
}
