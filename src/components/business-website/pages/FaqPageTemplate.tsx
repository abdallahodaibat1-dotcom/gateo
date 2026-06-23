'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { PageTemplateProps } from './page-template-types';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqPageTemplate({ business, page }: PageTemplateProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items: FaqItem[] = page.sections?.items?.length
    ? page.sections.items
    : [
        { question: 'ما هي طرق الدفع المتاحة؟', answer: 'نقبل الدفع عند الاستلام والبطاقات الإئتمانية والمحافظ الإلكترونية.' },
        { question: 'كم مدة التوصيل؟', answer: 'مدة التوصيل تتراوح بين 1-3 أيام عمل حسب الموقع.' },
        { question: 'هل يمكنني إرجاع المنتج؟', answer: 'نعم، يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بحالته الأصلية.' },
      ];

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--theme-primary)' }} />
        </motion.div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm overflow-hidden"
                style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-right"
                >
                  <span className="font-bold text-foreground flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pr-14 text-foreground/80 whitespace-pre-wrap leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center text-muted py-12">
            لا توجد أسئلة مضافة بعد. أضف أسئلة من لوحة التحكم.
          </div>
        )}
      </div>
    </div>
  );
}
