'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronLeft, Sparkles, Newspaper, Gamepad2, Puzzle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessSuggestion {
  id: string;
  name: string;
  logo: string | null;
  category: { name: string } | null;
  avgRating: number;
}

const trendingTopics = [
  { title: 'توسيع نطاق الأعمال الرقمية للجميع', readers: '٢٤٥ مشاهدة' },
  { title: 'مؤتمر ريادة الأعمال العامة', readers: '١٨٩ مشاهدة' },
  { title: 'نصائح لتسويق حسابك التجاري', readers: '١٥٦ مشاهدة' },
  { title: 'أفضل الأوقات لنشر المحتوى', readers: '١٢٣ مشاهدة' },
  { title: 'قصة نجاح: من المنزل إلى العلامة التجارية', readers: '٩٨ مشاهدة' },
];

export default function FeedRightSidebar() {
  const [suggestions, setSuggestions] = useState<BusinessSuggestion[]>([]);

  useEffect(() => {
    fetch('/api/businesses?limit=3&featured=true')
      .then((r) => r.ok ? r.json() : { businesses: [] })
      .then((data) => setSuggestions(data.businesses || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {/* Trending News */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">الأخبار والمواضيع الرائجة</h3>
          <Newspaper className="w-4 h-4 text-muted" />
        </div>
        <div className="divide-y divide-border">
          {trendingTopics.map((topic, i) => (
            <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary-dark transition-colors truncate">
                    {topic.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{topic.readers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/search"
          className="block px-4 py-3 text-xs font-medium text-primary hover:text-primary-dark hover:bg-slate-50 transition-colors border-t border-border"
        >
          عرض المزيد
        </Link>
      </motion.div>

      {/* Business Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">أعمال قد تعجبك</h3>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="divide-y divide-border">
            {suggestions.map((biz) => (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
              >
                <img
                  src={biz.logo || '/logo/favicon.svg'}
                  alt={biz.name}
                  className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary-dark transition-colors">
                    {biz.name}
                  </p>
                  <p className="text-xs text-muted">{biz.category?.name || 'عمل تجاري'}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-border" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Promo Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary rounded-lg shadow-sm p-4 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h3 className="font-semibold text-sm mb-1">أنشئ حسابك التجاري</h3>
          <p className="text-xs text-white/80 mb-3 leading-relaxed">
            احصلي على موقع إلكتروني خاص وحلول حجز متكاملة
          </p>
          <Link
            href="/business/apply"
            className="inline-block px-4 py-2 bg-surface text-primary text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            ابدأ الآن
          </Link>
        </div>
      </motion.div>

      {/* Mini Games / Break */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">استراحة سريعة</h3>
          <Gamepad2 className="w-4 h-4 text-muted" />
        </div>
        <div className="divide-y divide-border">
          <Link href="/ladies-gate" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary-dark transition-colors">تصفح البوابة العامة</p>
              <p className="text-xs text-muted">اكتشف محتوى مخصص</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-border" />
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
            <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary-dark transition-colors">تحدي النقاط</p>
              <p className="text-xs text-muted">تصدرّي لوحة المتصدرين</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-border" />
          </Link>
        </div>
      </motion.div>

      {/* Footer Links */}
      <div className="px-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <Link href="/" className="hover:text-foreground hover:underline">عن Gateo</Link>
        <Link href="/" className="hover:text-foreground hover:underline">الشروط</Link>
        <Link href="/" className="hover:text-foreground hover:underline">الخصوصية</Link>
        <Link href="/" className="hover:text-foreground hover:underline">المساعدة</Link>
        <span>Gateo © 2026</span>
      </div>
    </div>
  );
}
