import { prisma } from '@/lib/db';

export async function calculateCommission(
  appliesTo: string,
  amount: number,
  categoryId?: string | null,
  subcategoryId?: string | null
) {
  const rules = await prisma.commissionRule.findMany({
    where: {
      isActive: true,
      appliesTo,
      OR: [
        { categoryId: null, subcategoryId: null },
        { categoryId: categoryId || undefined, subcategoryId: null },
        { categoryId: categoryId || undefined, subcategoryId: subcategoryId || undefined },
      ],
    },
    orderBy: [{ categoryId: 'desc' }, { subcategoryId: 'desc' }],
  });

  const rule = rules[0];
  if (!rule) return { amount: 0, ruleId: null as string | null };

  let commission = 0;
  if (rule.type === 'PERCENTAGE') {
    commission = amount * (Number(rule.value) / 100);
  } else if (rule.type === 'FIXED') {
    commission = Number(rule.value);
  } else if (rule.type === 'TIERED') {
    commission = amount * (Number(rule.value) / 100);
  }

  if (rule.minAmount && commission < Number(rule.minAmount)) commission = Number(rule.minAmount);
  if (rule.maxAmount && commission > Number(rule.maxAmount)) commission = Number(rule.maxAmount);

  return { amount: +commission.toFixed(2), ruleId: rule.id };
}

export async function recordCommission(
  ruleId: string,
  amount: number,
  referenceType: string,
  referenceId: string,
  payload: { userId?: string; businessId?: string; description?: string } = {}
) {
  return prisma.commission.create({
    data: {
      ruleId,
      amount,
      currency: 'USD',
      referenceType,
      referenceId,
      userId: payload.userId,
      businessId: payload.businessId,
      description: payload.description,
      status: 'PENDING',
    },
  });
}
