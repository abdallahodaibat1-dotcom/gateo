'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Target, Award } from 'lucide-react';
import { PageTemplateProps } from './page-template-types';

export function AboutPageTemplate({ business, page }: PageTemplateProps) {
  const content = page.content || `تعرف على ${business.name}. نسعى دائماً لتقديم الأفضل لعملائنا.`;

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--theme-primary)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-8 md:p-12 mb-12"
          style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
        >
          <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: 'اسم النشاط', value: business.name },
            { icon: Users, label: 'المدينة', value: business.city || 'غير محدد' },
            { icon: Target, label: 'التقييم', value: `${business.avgRating.toFixed(1)} / 5` },
            { icon: Award, label: 'عدد التقييمات', value: `${business.reviewCount}` },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="bg-[var(--theme-surface)] rounded-xl border border-border p-5 text-center shadow-sm"
              style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted mb-1">{item.label}</p>
              <p className="font-bold text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
