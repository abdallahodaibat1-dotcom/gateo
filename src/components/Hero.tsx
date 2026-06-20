'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, Star, MapPin, Users, Briefcase, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-right"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4 text-accent fill-accent" />
              منصة الأعمال والمحترفين في العالم العربي
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              اكتشف عالم{' '}
              <span className="text-primary-light">
                الأعمال
              </span>{' '}
              والمحترفين
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              تواصل مع أفضل الشركات، العيادات، المكاتب الاستشارية، والمحترفين. احجز مواعيدك، تسوق المنتجات، وطوّر شبكتك المهنية بكل سهولة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/businesses"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary-light transition-colors"
                >
                  استكشف الأعمال
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all"
              >
                <Play className="w-5 h-5" />
                شاهد كيف تعمل
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8">
              {[
                { icon: Users, value: '50K+', label: 'مستخدم نشط' },
                { icon: Building2, value: '2,500+', label: 'نشاط تجاري' },
                { icon: Briefcase, value: '4.9', label: 'تقييم المنصة' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual / Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:block relative"
          >
            <div className="relative mx-auto w-[300px] h-[560px]">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl shadow-black/50 border-8 border-slate-800 overflow-hidden">
                <div className="absolute inset-1 rounded-[2.5rem] bg-slate-50 overflow-hidden">
                  <div className="p-5 pt-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary" />
                      <div className="w-8 h-8 rounded-lg bg-surface shadow-sm flex items-center justify-center">
                        <div className="w-4 h-4 rounded bg-primary/20" />
                      </div>
                    </div>
                    <div className="w-3/4 h-6 rounded-lg bg-primary/10 mb-3" />
                    <div className="w-1/2 h-4 rounded-lg bg-slate-200 mb-6" />
                    
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 h-28 rounded-2xl bg-primary/10 shadow-sm" />
                      <div className="flex-1 h-28 rounded-2xl bg-secondary/10 shadow-sm" />
                    </div>
                    <div className="h-24 rounded-2xl bg-surface shadow-sm mb-3 flex items-center gap-3 p-3">
                      <div className="w-16 h-16 rounded-xl bg-primary/10" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-3 rounded bg-slate-200" />
                        <div className="w-1/2 h-2 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-24 rounded-2xl bg-surface shadow-sm flex items-center gap-3 p-3">
                      <div className="w-16 h-16 rounded-xl bg-secondary/10" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-3 rounded bg-slate-200" />
                        <div className="w-1/2 h-2 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-8 top-20 w-20 h-20 rounded-2xl bg-surface shadow-xl flex items-center justify-center"
              >
                <Star className="w-8 h-8 text-accent fill-accent" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 bottom-32 w-16 h-16 rounded-2xl bg-surface shadow-xl flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
