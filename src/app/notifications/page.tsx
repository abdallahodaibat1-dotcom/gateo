'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { EmptyState, Skeleton } from '@/components/ui';
import {
  Loader2,
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  CheckCheck,
  CalendarClock,
  Star,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';

import Link from 'next/link';

interface NotificationData {
  actorId?: string;
  postId?: string;
  commentId?: string;
  bookingId?: string;
  businessId?: string;
  reviewId?: string;
  conversationId?: string;
  groupId?: string;
  invitationId?: string;
  professionalProfileId?: string;
  userId?: string;
  adId?: string;
  status?: string;
  link?: string;
  [key: string]: unknown;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: NotificationData | null;
  isRead: boolean;
  createdAt: string;
}

function getNotificationLink(type: string, data: NotificationData): string | null {
  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      return data.postId ? `/post/${data.postId}` : null;
    case 'FOLLOW':
      return data.actorId ? `/profile/${data.actorId}` : null;
    case 'MESSAGE':
      if (data.conversationId) return `/conversations/${data.conversationId}`;
      if (data.groupId) return `/groups/${data.groupId}`;
      return null;
    case 'BOOKING':
    case 'BOOKING_UPDATE':
      return data.bookingId ? `/bookings/${data.bookingId}` : null;
    case 'REVIEW':
      return data.businessId ? `/business/${data.businessId}` : null;
    case 'GROUP_INVITE':
      return data.groupId ? `/groups/${data.groupId}` : null;
    case 'SYSTEM':
      if (data.link) return data.link;
      if (data.businessId) return '/business-dashboard';
      if (data.professionalProfileId) return `/professional/${data.professionalProfileId}`;
      if (data.userId) return `/profile/${data.userId}`;
      return null;
    case 'PROMOTION':
      if (data.link) return data.link;
      if (data.adId) return `/marketplace`;
      if (data.businessId) return `/business/${data.businessId}`;
      return null;
    default:
      return data.link || null;
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  LIKE: <Heart className="w-5 h-5 text-danger" />,
  COMMENT: <MessageCircle className="w-5 h-5 text-primary" />,
  FOLLOW: <UserPlus className="w-5 h-5 text-success" />,
  MESSAGE: <MessageCircle className="w-5 h-5 text-secondary" />,
  BOOKING: <Bell className="w-5 h-5 text-warning" />,
  BOOKING_UPDATE: <CalendarClock className="w-5 h-5 text-accent" />,
  REVIEW: <Star className="w-5 h-5 text-accent" />,
  PROMOTION: <Megaphone className="w-5 h-5 text-primary" />,
  SYSTEM: <Settings className="w-5 h-5 text-muted" />,
  GROUP_INVITE: <Users className="w-5 h-5 text-secondary" />,
};

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/notifications')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        })
        .catch((_err) => {
          console.error(_err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (_err) {
      console.error(_err);
    }
  };



  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h1 className="text-lg font-bold text-foreground">الإشعارات</h1>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {loading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-4">
                    <Skeleton circle className="w-10 h-10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-4" />
                      <Skeleton className="w-1/2 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="لا توجد إشعارات"
                description="ستظهر الإشعارات الجديدة هنا عند تفاعل الآخرين مع محتواك"
              />
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const data = notification.data || {};
                  const link = data.link || getNotificationLink(notification.type, data);
                  const isClickable = link && link !== '#';

                  const handleClick = async (e: React.MouseEvent) => {
                    if (!isClickable) {
                      e.preventDefault();
                    }
                    if (!notification.isRead) {
                      try {
                        const res = await fetch(`/api/notifications/${notification.id}`, { method: 'PUT' });
                        if (res.ok) {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
                          );
                          setUnreadCount((prev) => Math.max(0, prev - 1));
                        }
                      } catch (_err) {
                        console.error(_err);
                      }
                    }
                  };

                  const content = (
                    <div
                      onClick={handleClick}
                      className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {typeIcons[notification.type] || <Bell className="w-5 h-5 text-muted" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {notification.title}
                        </div>
                        {notification.body && (
                          <div className="text-sm text-muted mt-0.5">{notification.body}</div>
                        )}
                        <div className="text-xs text-muted mt-1">{formatDate(notification.createdAt)}</div>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  );

                  return isClickable ? (
                    <Link key={notification.id} href={link} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
