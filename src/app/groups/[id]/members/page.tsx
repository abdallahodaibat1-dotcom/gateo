'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui';
import { Loader2, Users, ArrowRight, ChevronLeft, Shield, UserX, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useConfirm } from '@/hooks/useConfirm';

interface GroupMember {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string | null; avatar: string | null };
}

interface GroupInfo {
  id: string;
  name: string;
  memberRole: string | null;
}

export default function GroupMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!id) return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchGroupInfo();
      fetchMembers(1);
    }
  }, [id, status]);

  const fetchGroupInfo = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGroup({ id: data.group.id, name: data.group.name, memberRole: data.group.memberRole });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async (pageNum: number) => {
    try {
      const res = await fetch(`/api/groups/${id}/members?page=${pageNum}&limit=30`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setMembers(data.members);
        } else {
          setMembers((prev) => [...prev, ...data.members]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/groups/${id}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.user.id === userId ? { ...m, role } : m))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من إزالة هذا العضو؟' });
    if (!ok) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/groups/${id}/members/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchMembers(next);
  };

  const isAdmin = group?.memberRole === 'ADMIN';

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back */}
          <Link
            href={`/groups/${id}`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-3 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {group?.name || 'المجموعة'}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4"
          >
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">أعضاء المجموعة</h1>
                <p className="text-sm text-muted">{members.length} عضو</p>
              </div>
            </div>
          </motion.div>

          {/* Members List */}
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {members.map((member) => {
                const roleLabel =
                  member.role === 'ADMIN'
                    ? 'مشرف'
                    : member.role === 'MODERATOR'
                    ? 'مشرف مساعدة'
                    : 'عضو';
                const RoleIcon =
                  member.role === 'ADMIN' ? Crown : member.role === 'MODERATOR' ? Shield : null;

                return (
                  <div
                    key={member.user.id}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <Link href={`/profile/${member.user.id}`} className="flex-shrink-0">
                      <img
                        src={member.user.avatar || '/logo/favicon.svg'}
                        alt={member.user.name || ''}
                        className="w-11 h-11 rounded-full object-cover border border-border bg-surface"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${member.user.id}`}>
                        <div className="font-medium text-sm text-foreground hover:text-primary transition-colors">
                          {member.user.name || 'مستخدم'}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            member.role === 'ADMIN'
                              ? 'text-primary'
                              : member.role === 'MODERATOR'
                              ? 'text-secondary'
                              : 'text-muted'
                          }`}
                        >
                          {RoleIcon && <RoleIcon className="w-3 h-3" />}
                          {roleLabel}
                        </span>
                        <span className="text-xs text-muted">
                          · {new Date(member.joinedAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && member.user.id !== session?.user?.id && (
                      <div className="flex items-center gap-1">
                        {member.role !== 'ADMIN' && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateRole(
                                  member.user.id,
                                  member.role === 'MODERATOR' ? 'MEMBER' : 'MODERATOR'
                                )
                              }
                              disabled={actionLoading === member.user.id}
                              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                            >
                              {member.role === 'MODERATOR' ? 'إلغاء الترقية' : 'ترقية'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.user.id)}
                              disabled={actionLoading === member.user.id}
                              className="p-1.5 rounded-md text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                              aria-label="إزالة العضو"
                              title="إزالة"
                            >
                              {actionLoading === member.user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <Link href={`/profile/${member.user.id}`} aria-label="عرض الملف الشخصي">
                      <ChevronLeft className="w-4 h-4 text-muted" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {members.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">لا يوجد أعضاء في هذه المجموعة</p>
              </div>
            )}

            {hasMore && (
              <div className="p-4 border-t border-border flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-5 py-2 rounded-md bg-surface border border-border text-sm text-foreground hover:bg-slate-50 transition-colors"
                >
                  تحميل المزيد
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <ConfirmDialog />
    </>
  );
}
