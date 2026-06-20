'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/ui/EmptyState';
import { Loader2, Users, Check, X, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Invitation {
  id: string;
  status: string;
  createdAt: string;
  group: {
    id: string;
    name: string;
    image: string | null;
    isPublic: boolean;
    _count: { members: number };
  };
  invitedBy: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export default function InvitationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchInvitations();
    }
  }, [status]);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, { method: 'POST' });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/reject`, { method: 'POST' });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

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

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            المجموعات
          </Link>

          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4">
            <div className="p-5 border-b border-border">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                دعوات الانضمام
                {invitations.length > 0 && (
                  <span className="mr-1 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {invitations.length}
                  </span>
                )}
              </h1>
            </div>

            <div className="p-4">
              {invitations.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="لا توجد دعوات"
                  description="ستظهر هنا الدعوات التي تتلقينها للانضمام للمجموعات"
                />
              ) : (
                <div className="space-y-3">
                  {invitations.map((inv) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 rounded-lg p-4 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          {inv.group.image ? (
                            <img src={inv.group.image} alt={inv.group.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-foreground font-bold text-lg">
                              {inv.group.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/groups/${inv.group.id}`} className="font-bold text-foreground hover:text-primary-dark transition-colors">
                            {inv.group.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {inv.group._count.members} عضو
                            </span>
                            <span>{inv.group.isPublic ? 'عامة' : 'خاصة'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <img
                              src={inv.invitedBy.avatar || '/logo/favicon.svg'}
                              alt={inv.invitedBy.name || ''}
                              className="w-5 h-5 rounded-full object-cover border border-border bg-surface"
                            />
                            <span className="text-xs text-muted">
                              دعاك <span className="font-medium text-foreground">{inv.invitedBy.name || 'مستخدم'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                        <button
                          onClick={() => handleAccept(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          {actionLoading === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          قبول
                        </button>
                        <button
                          onClick={() => handleReject(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          رفض
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
