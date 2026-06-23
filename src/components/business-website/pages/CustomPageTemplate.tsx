'use client';

import { motion } from 'framer-motion';
import { PageTemplateProps } from './page-template-types';

export function CustomPageTemplate({ business, page }: PageTemplateProps) {
  const content = page.content || 'لا يوجد محتوى لهذه الصفحة بعد.';

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
          className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-8 md:p-12"
          style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
        >
          <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
