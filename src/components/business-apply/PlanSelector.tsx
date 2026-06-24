'use client';

import { motion } from 'framer-motion';
import { Check, CreditCard, Loader2, Medal, Star } from 'lucide-react';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';

export interface PlanOption {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

interface PlanSelectorProps {
  plans: PlanOption[];
  loading: boolean;
  error?: string;
  selectedPlanId?: string;
  onSelect: (planId: string) => void;
  onNext: () => void;
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`;
}

const planMeta: Record<string, { iconColor: string; ringColor: string; shadowColor: string; label: string; websiteType: 'INTRO' | 'STORE' }> = {
  Bronze: { iconColor: 'text-amber-700', ringColor: 'ring-amber-500', shadowColor: 'shadow-amber-500/20', label: 'موقع تعريفي', websiteType: 'INTRO' },
  Silver: { iconColor: 'text-slate-500', ringColor: 'ring-slate-400', shadowColor: 'shadow-slate-400/20', label: 'موقع تعريفي', websiteType: 'INTRO' },
  Gold: { iconColor: 'text-amber-500', ringColor: 'ring-amber-400', shadowColor: 'shadow-amber-400/20', label: 'موقع تعريفي', websiteType: 'INTRO' },
  'Store Plus': { iconColor: 'text-blue-500', ringColor: 'ring-blue-400', shadowColor: 'shadow-blue-400/20', label: 'متجر إلكتروني', websiteType: 'STORE' },
  'Store Plus Plus': { iconColor: 'text-purple-500', ringColor: 'ring-purple-400', shadowColor: 'shadow-purple-400/20', label: 'متجر إلكتروني', websiteType: 'STORE' },
  'Store Plus Plus Plus': { iconColor: 'text-amber-500', ringColor: 'ring-amber-400', shadowColor: 'shadow-amber-400/20', label: 'متجر إلكتروني', websiteType: 'STORE' },
};

export function getPlanWebsiteType(planName: string): 'INTRO' | 'STORE' {
  return planMeta[planName]?.websiteType ?? 'INTRO';
}

export function PlanSelector({ plans, loading, error, selectedPlanId, onSelect, onNext }: PlanSelectorProps) {
  const handleSelect = (planId: string) => {
    onSelect(planId);
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-fuchsia-50/40 to-white pb-12">
      <main className="pt-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="inline-block text-xs font-bold tracking-wide text-emerald-500 uppercase mb-2">
              خطط الأسعار
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              اختر الخطة المناسبة لعملك
            </h1>
            <p className="text-muted text-sm max-w-lg mx-auto">
              ابدأ مجاناً ووسّع أعمالك مع خطط تناسب كل مرحلة. يمكنك الترقية أو التعديل لاحقاً من لوحة التحكم.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Plans */}
          {!loading && plans.length === 0 && (
            <Card>
              <EmptyState
                icon={CreditCard}
                title="لا توجد خطط متاحة"
                description="ستظهر خطط الاشتراك هنا قريباً."
              />
            </Card>
          )}

          {!loading && plans.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.slice(0, 6).map((plan, index) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isFree = plan.price === 0;
                  const meta = planMeta[plan.name] || {
                    iconColor: 'text-primary',
                    ringColor: 'ring-primary',
                    shadowColor: 'shadow-primary/20',
                    label: 'خطة اشتراك',
                  };
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <Card
                        padding="sm"
                        shadow="sm"
                        className={`h-full flex flex-col cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? `ring-2 ${meta.ringColor} border-transparent ${meta.shadowColor} shadow-lg`
                            : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => handleSelect(plan.id)}
                      >
                        {/* Plan icon & name */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-11 h-11 rounded-full bg-white border border-border shadow-sm flex items-center justify-center ${meta.iconColor}`}
                          >
                            <Medal className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground leading-tight">
                              {plan.nameAr || plan.name}
                            </h3>
                            <p className="text-[10px] text-muted">{meta.label}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline gap-1">
                            {isFree ? (
                              <span className="text-2xl font-extrabold text-blue-600">مجاناً</span>
                            ) : (
                              <>
                                <span className="text-2xl font-extrabold text-blue-600">{formatMoney(plan.price)}</span>
                                <span className="text-xs text-muted">/ {plan.duration} يوم</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                            {isFree ? 'ابدأ الآن بدون مقابل' : 'Get 7 Days Free Trial'}
                          </p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-1.5 mb-4 flex-1">
                          {plan.features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length === 0 && (
                            <li className="text-xs text-muted">لا توجد مميزات محددة</li>
                          )}
                        </ul>

                        {/* CTA */}
                        <Button
                          size="sm"
                          className={`w-full transition-all ${
                            isSelected
                              ? 'bg-primary hover:bg-primary-dark'
                              : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                          }`}
                          variant="primary"
                          leftIcon={isSelected ? <Check className="w-3.5 h-3.5" /> : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(plan.id);
                          }}
                        >
                          {isSelected ? 'الخطة المختارة' : 'اختيار الخطة'}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
}
