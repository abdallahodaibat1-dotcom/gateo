'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, ArrowLeft, TrendingUp, Loader2, CalendarDays, MessageSquare, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui';

interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cover: string | null;
  city: string | null;
  avgRating: number;
  reviewCount: number;
  bookingCount: number;
  powerScore: number;
  category: { id: string; name: string } | null;
  isVerified: boolean;
}

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/businesses?featured=true&limit=8&sort=power')
      .then((r) => r.ok ? r.json() : { businesses: [] })
      .then((data) => {
        setBusinesses(data.businesses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="featured" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg border border-border overflow-hidden">
                <Skeleton className="h-48 rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (businesses.length === 0) {
    return (
      <section id="featured" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            الأعمال <span className="text-primary">المميزة</span>
          </h2>
          <p className="text-muted">ستظهر الأعمال المميزة قريباً...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4" />
              الأعمال المميزة
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              الأكثر <span className="text-primary">تفاعلاً</span> هذا الأسبوع
            </h2>
            <p className="text-muted mt-2 text-sm">مرتبة حسب قوة الحساب: الحجوزات، التقييمات، والتفاعل</p>
          </div>
          <Link 
            href="/businesses"
            className="flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors group"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((biz, i) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
            >
              <Link href={`/business/${biz.slug || biz.id}`}>
                <div className="bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border">
                  <div className="relative h-48 overflow-hidden">
                    {biz.cover ? (
                      <img 
                        src={biz.cover} 
                        alt={biz.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        i % 4 === 0 ? 'from-blue-200 to-indigo-200' :
                        i % 4 === 1 ? 'from-teal-200 to-cyan-200' :
                        i % 4 === 2 ? 'from-amber-200 to-orange-200' :
                        'from-slate-200 to-gray-200'
                      }`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    <div className="absolute top-3 right-3 flex gap-2">
                      {i < 3 && (
                        <span className="px-2.5 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-sm flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          #{i + 1}
                        </span>
                      )}
                      {biz.isVerified && (
                        <span className="px-2 py-1 rounded-full bg-surface text-primary text-xs font-bold shadow-sm flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          موثق
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted hover:text-primary hover:bg-white transition-all"
                      aria-label="المفضلة"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      {biz.logo && (
                        <img 
                          src={biz.logo} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover border border-border"
                        />
                      )}
                      <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md">
                        {biz.category?.name || 'عمل تجاري'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors">
                      {biz.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {biz.city || 'الرياض'}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-muted bg-slate-100 px-2 py-1 rounded-md">
                        <CalendarDays className="w-3 h-3" />
                        {biz.bookingCount} حجز
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted bg-slate-100 px-2 py-1 rounded-md">
                        <MessageSquare className="w-3 h-3" />
                        {biz.reviewCount} تقييم
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-bold text-foreground">{biz.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-muted">({biz.reviewCount})</span>
                      </div>
                      <span className="text-xs font-medium text-success bg-success/5 px-2 py-1 rounded-md">
                        مفتوح الآن
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
