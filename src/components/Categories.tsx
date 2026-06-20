'use client';

import { motion } from 'framer-motion';
import {
  Stethoscope,
  Scale,
  Cpu,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  Briefcase,
  UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    name: 'الصحة والطب',
    description: 'عيادات، أطباء، وخدمات صحية موثوقة.',
    icon: Stethoscope,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-700',
    count: '800+',
    href: '/businesses/health',
  },
  {
    name: 'القانون والاستشارات',
    description: 'محامون، مكاتب استشارية، وخبراء قانونيون.',
    icon: Scale,
    color: 'from-slate-500 to-slate-700',
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-700',
    count: '350+',
    href: '/businesses/legal',
  },
  {
    name: 'التقنية والهندسة',
    description: 'شركات تقنية، مهندسون، ومطورون محترفون.',
    icon: Cpu,
    color: 'from-indigo-500 to-indigo-700',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-700',
    count: '620+',
    href: '/businesses/tech',
  },
  {
    name: 'التعليم والتدريب',
    description: 'أكاديميات، مدربون، ودورات تدريبية.',
    icon: GraduationCap,
    color: 'from-teal-500 to-teal-700',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-700',
    count: '510+',
    href: '/businesses/education',
  },
  {
    name: 'المطاعم والتجزئة',
    description: 'مطاعم، مقاهي، متاجر، وخدمات استهلاكية.',
    icon: UtensilsCrossed,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-700',
    count: '1,400+',
    href: '/businesses/food-retail',
  },
  {
    name: 'الأعمال والخدمات',
    description: 'شركات متعددة الخدمات والأنشطة التجارية.',
    icon: Briefcase,
    color: 'from-primary to-primary-dark',
    bgColor: 'bg-blue-50',
    iconColor: 'text-primary',
    count: '900+',
    href: '/businesses',
  },
  {
    name: 'التسوق',
    description: 'منتجات متنوعة متاحة مباشرة من البائعين.',
    icon: ShoppingBag,
    color: 'from-amber-500 to-amber-700',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-700',
    count: '3,500+',
    href: '/marketplace',
  },
  {
    name: 'الجمال والموضة',
    description: 'صالونات تجميل، عيادات تجميل، وخدمات أزياء.',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-700',
    count: '1,200+',
    href: '/ladies-gate',
  },
];

export default function Categories() {
  return (
    <section id="categories" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            استكشف القطاعات
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            أعمال وخدمات <span className="text-primary">متنوعة</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            تصفح القطاعات المختلفة واكتشف الشركات والمحترفين المناسبين لاحتياجاتك.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={cat.href} className="block">
                <div className="relative h-full bg-surface rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-12 h-12 rounded-lg ${cat.bgColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                    <cat.icon className={`w-6 h-6 ${cat.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{cat.name}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{cat.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">{cat.count}</span>
                    <span className="text-sm text-muted">نشاط</span>
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
