'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Users, ArrowRight } from 'lucide-react';

interface FollowUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

export default function FollowingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchFollowing();
  }, [id]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}/following`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          <Card className="mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-muted" />
              </button>
              <h1 className="text-lg font-bold text-foreground">المتابَعون</h1>
            </div>
          </Card>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="flex items-center gap-3">
                  <Skeleton circle className="w-12 h-12" />
                  <Skeleton className="h-4 w-1/3" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-10">
              <p className="text-muted">حدث خطأ أثناء جلب المتابَعين.</p>
            </Card>
          ) : following.length === 0 ? (
            <EmptyState
              icon={Users}
              title="لا يتابع أحدًا"
              description="هذا المستخدم لا يتابع أي حسابات بعد."
            />
          ) : (
            <div className="space-y-3">
              {following.map((user) => (
                <Link key={user.id} href={`/profile/${user.id}`}>
                  <Card className="flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <img
                      src={user.avatar || '/logo/favicon.svg'}
                      alt={user.name || 'مستخدم'}
                      className="w-12 h-12 rounded-full object-cover border border-border bg-surface"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">
                        {user.name || 'مستخدم'}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
