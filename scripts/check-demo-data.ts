import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const counts = {
    countries: await prisma.country.count(),
    cities: await prisma.city.count(),
    demoUsers: await prisma.user.count({ where: { email: { endsWith: '.demo@gateo.com' } } }),
    profiles: await prisma.profile.count({ where: { userId: { in: (await prisma.user.findMany({ where: { email: { endsWith: '.demo@gateo.com' } }, select: { id: true } })).map((u) => u.id) } } }),
    follows: await prisma.follow.count({ where: { followerId: { in: (await prisma.user.findMany({ where: { email: { endsWith: '.demo@gateo.com' } }, select: { id: true } })).map((u) => u.id) } } }),
    posts: await prisma.post.count({ where: { id: { startsWith: 'demo-post-' } } }),
    comments: await prisma.comment.count({ where: { id: { startsWith: 'demo-comment-' } } }),
    likes: await prisma.like.count({ where: { id: { startsWith: 'demo-like-' } } }),
    savedPosts: await prisma.savedPosts.count({ where: { id: { startsWith: 'demo-saved-' } } }),
    reviews: await prisma.review.count({ where: { id: { startsWith: 'demo-review-' } } }),
    services: await prisma.service.count({ where: { id: { startsWith: 'demo-service-' } } }),
    bookings: await prisma.booking.count({ where: { id: { startsWith: 'demo-booking-' } } }),
    groups: await prisma.group.count({ where: { id: { startsWith: 'demo-group-' } } }),
    groupMembers: await prisma.groupMember.count({ where: { id: { startsWith: 'demo-gmember-' } } }),
    groupPosts: await prisma.groupPosts.count({ where: { id: { startsWith: 'demo-gpost-' } } }),
    groupMessages: await prisma.groupMessage.count({ where: { id: { startsWith: 'demo-gmsg-' } } }),
    conversations: await prisma.conversation.count({ where: { id: { startsWith: 'demo-conv-' } } }),
    conversationParticipants: await prisma.conversationParticipant.count({ where: { id: { startsWith: 'demo-cpart-' } } }),
    messages: await prisma.message.count({ where: { id: { startsWith: 'demo-msg-' } } }),
    stories: await prisma.story.count({ where: { id: { startsWith: 'demo-story-' } } }),
    professionalProfiles: await prisma.professionalProfile.count({ where: { id: { startsWith: 'demo-prof-' } } }),
    businessSubscriptions: await prisma.businessSubscription.count({ where: { id: { startsWith: 'demo-sub-' } } }),
    notifications: await prisma.notification.count({ where: { id: { startsWith: 'demo-notif-' } } }),
    pointTransactions: await prisma.pointTransaction.count({ where: { id: { startsWith: 'demo-ptx-' } } }),
    userBadges: await prisma.userBadge.count({ where: { id: { startsWith: 'demo-ubadge-' } } }),
    demoAds: await prisma.ad.count({ where: { id: { startsWith: 'demo-ad-' } } }),
    businessesLinkedToCountry: await prisma.business.count({ where: { countryId: { not: null } } }),
  };

  for (const [key, value] of Object.entries(counts)) {
    console.log(`${key}: ${value}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
