import { prisma } from './db';

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  type: 'EARN' | 'BONUS' | 'REFUND' = 'EARN',
  referenceId?: string
) {
  const [transaction, updatedUser] = await prisma.$transaction([
    prisma.pointTransaction.create({
      data: {
        userId,
        amount,
        reason,
        type,
        referenceId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: amount },
        xp: { increment: amount },
      },
    }),
  ]);

  // Check level up: simple formula level = 1 + floor(xp / 500)
  const newLevel = 1 + Math.floor(updatedUser.xp / 500);
  if (newLevel > updatedUser.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  // Check badge unlocks
  await checkBadges(userId);

  return { transaction, user: updatedUser };
}

async function checkBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          Post: true,
          Booking: true,
          Review: true,
          follows_follows_followerIdTousers: true,
        },
      },
      UserBadge: { select: { badgeId: true } },
    },
  });

  if (!user) return;

  const earnedBadgeIds = new Set(user.UserBadge.map((ub) => ub.badgeId));
  const badges = await prisma.badge.findMany();

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let earned = false;
    const condition = badge.condition;

    if (condition === 'register') {
      earned = true;
    } else if (condition.startsWith('posts>=')) {
      const min = parseInt(condition.split('>=')[1]);
      earned = user._count.Post >= min;
    } else if (condition.startsWith('bookings>=')) {
      const min = parseInt(condition.split('>=')[1]);
      earned = user._count.Booking >= min;
    } else if (condition.startsWith('reviews>=')) {
      const min = parseInt(condition.split('>=')[1]);
      earned = user._count.Review >= min;
    } else if (condition.startsWith('following>=')) {
      const min = parseInt(condition.split('>=')[1]);
      earned = user._count.follows_follows_followerIdTousers >= min;
    } else if (condition.startsWith('level>=')) {
      const min = parseInt(condition.split('>=')[1]);
      earned = user.level >= min;
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      // Award badge points
      if (badge.pointsReward > 0) {
        await prisma.pointTransaction.create({
          data: {
            userId,
            amount: badge.pointsReward,
            reason: `حصلت على شارة: ${badge.nameAr || badge.name}`,
            type: 'BONUS',
          },
        });
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: { increment: badge.pointsReward },
            xp: { increment: badge.pointsReward },
          },
        });
      }
    }
  }
}
