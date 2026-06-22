'use client';

import { motion } from 'framer-motion';
import { LayoutTemplate, Check } from 'lucide-react';
import { getHomeTemplateList, HomeTemplate } from '@/lib/business-template-generator';

interface HomeTemplateSelectorProps {
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
  disabled?: boolean;
}

const ALL_TEMPLATES = getHomeTemplateList();

export function HomeTemplateSelector({
  selectedTemplateId,
  onSelect,
  disabled,
}: HomeTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-primary" />
          اختر تصميم الصفحة الرئيسية
        </h2>
        <p className="text-sm text-muted mt-0.5">
          يمكنك تغيير هذا لاحقاً من لوحة التحكم.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {ALL_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <motion.button
              key={template.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              onClick={() => onSelect(template.id)}
              className={`text-right rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-muted border-border'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <LayoutTemplate className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm mb-0.5">{template.nameAr}</h3>
                  <p className="text-xs text-muted leading-relaxed">{template.descriptionAr}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
