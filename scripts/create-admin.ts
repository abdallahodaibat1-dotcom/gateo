import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@gateo.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'مدير المنصة';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN', accountType: 'USER' },
      });
      console.log(`✓ تم ترقية المستخدم ${email} إلى مشرف`);
    } else {
      console.log(`✓ حساب المشرف ${email} موجود مسبقاً`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      accountType: 'USER',
      emailVerified: new Date(),
      updatedAt: new Date(),
      Profile: { create: { updatedAt: new Date() } },
    },
  });

  console.log(`✓ تم إنشاء حساب المشرف`);
  console.log(`  البريد: ${email}`);
  console.log(`  كلمة المرور: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
