'use client';

import { useEffect, useState } from 'react';
import { Award, Lock } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface Badge {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  color?: string;
  pointsReward: number;
  earned?: boolean;
  earnedAt?: string;
}

export default function BadgesPage() {
  const [earned, setEarned] = useState<Badge[]>([]);
  const [available, setAvailable] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account/me/badges')
      .then((res) => res.json())
      .then((data) => {
        setEarned(data.earned || []);
        setAvailable(data.available || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-10 w-1/3 mx-auto mb-3" />
          <Skeleton className="h-5 w-1/2 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Award className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground mb-2">الشارات</h1>
          <p className="text-muted">اجمع الشارات واحصلي على نقاط إضافية</p>
        </div>

        {/* Earned Badges */}
        {earned.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              الشارات المكتسبة
              <span className="text-sm font-normal text-muted">({earned.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earned.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-surface rounded-lg p-5 border border-border shadow-sm text-center hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-primary/10"
                  >
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{badge.nameAr || badge.name}</h3>
                  <p className="text-xs text-muted mt-1">{badge.description}</p>
                  <p className="text-sm text-primary font-semibold mt-2">+{badge.pointsReward} نقطة</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available Badges */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted" />
            شارات قيد التحقق
            <span className="text-sm font-normal text-muted">({available.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {available.map((badge) => (
              <div
                key={badge.id}
                className="bg-surface rounded-lg p-5 border border-border shadow-sm text-center opacity-60 hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-slate-100">
                  <Lock className="w-8 h-8 text-muted" />
                </div>
                <h3 className="font-bold text-foreground">{badge.nameAr || badge.name}</h3>
                <p className="text-xs text-muted mt-1">{badge.description}</p>
                <p className="text-sm text-primary font-semibold mt-2">+{badge.pointsReward} نقطة</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
