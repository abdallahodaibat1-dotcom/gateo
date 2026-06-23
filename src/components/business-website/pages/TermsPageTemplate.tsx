'use client';

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { PageTemplateProps } from './page-template-types';

export function TermsPageTemplate({ business, page }: PageTemplateProps) {
  const content = page.content || `شروط وأحكام استخدام موقع ${business.name}. يرجى قراءتها بعناية.`;

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
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">الشروط والأحكام</h2>
          </div>
          <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
