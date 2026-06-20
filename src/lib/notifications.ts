import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/db';

type NotificationSettings = {
  likes?: boolean;
  comments?: boolean;
  follows?: boolean;
  messages?: boolean;
  bookings?: boolean;
  bookingUpdates?: boolean;
  reviews?: boolean;
  promotions?: boolean;
  system?: boolean;
  groupInvites?: boolean;
};

const defaultSettings: Required<NotificationSettings> = {
  likes: true,
  comments: true,
  follows: true,
  messages: true,
  bookings: true,
  bookingUpdates: true,
  reviews: true,
  promotions: true,
  system: true,
  groupInvites: true,
};

const typeToSettingKey: Record<NotificationType, keyof NotificationSettings> = {
  LIKE: 'likes',
  COMMENT: 'comments',
  FOLLOW: 'follows',
  MESSAGE: 'messages',
  BOOKING: 'bookings',
  BOOKING_UPDATE: 'bookingUpdates',
  REVIEW: 'reviews',
  SYSTEM: 'system',
  PROMOTION: 'promotions',
  GROUP_INVITE: 'groupInvites',
};

/**
 * Build a deep link for a notification based on its type and data payload.
 * Returns null when no meaningful target exists.
 */
export function buildNotificationLink(
  type: NotificationType,
  data: Record<string, unknown> | null | undefined
): string | null {
  if (!data) return null;

  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      if (data.postId) return `/post/${data.postId}`;
      break;

    case 'FOLLOW':
      if (data.actorId) return `/profile/${data.actorId}`;
      break;

    case 'MESSAGE':
      if (data.conversationId) return `/conversations/${data.conversationId}`;
      if (data.groupId) return `/groups/${data.groupId}`;
      break;

    case 'BOOKING':
    case 'BOOKING_UPDATE':
      if (data.bookingId) return `/bookings/${data.bookingId}`;
      break;

    case 'REVIEW':
      if (data.businessId) return `/business/${data.businessId}`;
      if (data.reviewId) return `/business/${data.businessId}?review=${data.reviewId}`;
      break;

    case 'GROUP_INVITE':
      if (data.groupId) return `/groups/${data.groupId}`;
      break;

    case 'SYSTEM':
      if (data.businessId) return `/business-dashboard`;
      if (data.professionalProfileId) return `/professional/${data.professionalProfileId}`;
      if (data.userId) return `/profile/${data.userId}`;
      break;

    case 'PROMOTION':
      if (data.link && typeof data.link === 'string') return data.link;
      if (data.adId) return `/marketplace`;
      if (data.businessId) return `/business/${data.businessId}`;
      break;

    default:
      break;
  }

  if (data.link && typeof data.link === 'string') return data.link;
  return null;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  data?: Record<string, unknown>;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });

    if (!user) return;

    const settings = (user.notificationSettings as NotificationSettings | null) || {};
    const key = typeToSettingKey[type];
    const enabled = settings[key] ?? defaultSettings[key];

    if (enabled === false) return;

    const link = buildNotificationLink(type, data || {});

    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data ? JSON.stringify({ ...(data || {}), ...(link ? { link } : {}) }) : undefined,
      },
    });
  } catch (error) {
    console.error('createNotification error:', error);
  }
}
