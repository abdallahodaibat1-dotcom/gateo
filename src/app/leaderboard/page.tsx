import { Metadata } from 'next';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { Trophy, Medal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'لوحة المتصدرين | Gateo',
  description: 'اكتشف الأعضاء الأكثر نشاطاً في Gateo',
};

async function getLeaderboard() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/leaderboard`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leaderboard || [];
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  const medalColors = ['text-yellow-500', 'text-muted', 'text-amber-600'];

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة المتصدرين</h1>
          <p className="text-muted">الأعضاء الأكثر نشاطاً وإسهاماً في مجتمع Gateo</p>
        </div>

        <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Trophy}
                title="لا يوجد متصدرين بعد"
                description="كني أول من تصل للقمة!"
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 ${index < 3 ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {index < 3 ? (
                      <Medal className={`w-6 h-6 ${medalColors[index]}`} />
                    ) : (
                      <span className="text-muted">{index + 1}</span>
                    )}
                  </div>

                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name?.charAt(0) || '؟'
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.name || 'مستخدم'}</h3>
                      <p className="text-sm text-muted">المستوى {user.level}</p>
                    </div>
                  </Link>

                  <div className="text-right">
                    <p className="font-bold text-primary">{user.points} نقطة</p>
                    <p className="text-xs text-muted">{user.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
