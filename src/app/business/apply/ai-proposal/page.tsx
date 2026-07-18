'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Palette,
  Type,
  FileText,
  Users,
  Layout,
  ImageIcon,
  Sparkles,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { loadWizardData, saveWizardData } from '@/lib/ai-wizard/types';
import { BusinessAnalysisOutput } from '@/lib/ai/schemas/business-analysis-schema';
import { recommendDesigns } from '@/lib/ai/design/design-recommender';

function getInitialState() {
  const loaded = loadWizardData();
  const recs = loaded.analysis
    ? recommendDesigns(loaded.analysis, loaded.analysis.websiteType)
    : [];
  return {
    data: loaded,
    selectedDesignId: loaded.selectedDesignId || '',
    recommendations: recs,
  };
}

export default function AiProposalPage() {
  const { status } = useSession();
  const router = useRouter();

  const [state, setState] = useState(getInitialState);
  const { data, selectedDesignId, recommendations } = state;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/ai-proposal');
      return;
    }
    if (status === 'loading') return;

    if (!data.analysis) {
      router.push('/business/apply/ai-analyze');
    }
  }, [status, router, data.analysis]);

  const handleSelectDesign = (designId: string) => {
    const updated = { ...data, selectedDesignId: designId };
    setState((prev) => ({ ...prev, data: updated, selectedDesignId: designId }));
    saveWizardData(updated);
  };

  const handleContinue = () => {
    if (!selectedDesignId) return;
    const updated = { ...data, selectedDesignId };
    saveWizardData(updated);
    router.push('/business/apply/ai-build');
  };

  if (status === 'loading' || !data.analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const analysis = data.analysis as BusinessAnalysisOutput;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            نتائج التحليل الذكي
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اقتراحات مخصصة لـ {data.businessName}</h1>
          <p className="text-gray-600">راجع الاقتراحات واختر التصميم الأنسب قبل إنشاء الموقع.</p>
        </div>

        {/* Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص التحليل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SummaryItem icon={FileText} label="نوع النشاط" value={analysis.businessType} />
            <SummaryItem
              icon={Users}
              label="الجمهور المستهدف"
              value={data.audiences
                .map((a) => {
                  const map: Record<string, string> = {
                    individuals: 'أفراد',
                    companies: 'شركات',
                    government: 'جهات حكومية',
                    students: 'طلاب',
                    women: 'سيدات',
                    men: 'رجال',
                    children: 'أطفال',
                    everyone: 'الجميع',
                  };
                  return map[a] || a;
                })
                .join('، ')}
            />
            <SummaryItem icon={Layout} label="نمط التصميم" value={analysis.designStyle} />
            <SummaryItem
              icon={FileText}
              label="الصفحات المقترحة"
              value={`${analysis.suggestedPages.length} صفحات`}
            />
            <SummaryItem
              icon={Palette}
              label="الألوان"
              value={
                <div className="flex items-center gap-1">
                  <ColorDot color={analysis.colors.primaryColor} />
                  <ColorDot color={analysis.colors.secondaryColor} />
                  <ColorDot color={analysis.colors.accentColor} />
                </div>
              }
            />
            <SummaryItem icon={Type} label="الخط المقترح" value={analysis.fontFamily} />
            <SummaryItem
              icon={ImageIcon}
              label="أسلوب الصور"
              value={analysis.imageStyle}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>

          <div className="mt-6 p-4 bg-violet-50 rounded-xl text-violet-800 text-sm leading-relaxed">
            {analysis.reasoning}
          </div>
        </motion.div>

        {/* Design Recommendations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">أفضل 3 تصاميم موصى بها</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.design.designId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => handleSelectDesign(rec.design.designId)}
                  className={`w-full text-right rounded-3xl border-2 transition-all overflow-hidden ${
                    selectedDesignId === rec.design.designId
                      ? 'border-violet-500 ring-1 ring-violet-500 shadow-lg'
                      : 'border-gray-200 hover:border-violet-300 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {rec.design.previewImage ? (
                      <img
                        src={rec.design.previewImage}
                        alt={rec.design.nameAr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        بدون معاينة
                      </div>
                    )}
                    {index === 0 && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-violet-600 text-white text-xs font-medium">
                        الأنسب
                      </div>
                    )}
                    {selectedDesignId === rec.design.designId && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{rec.design.nameAr}</h3>
                    <p className="text-sm text-violet-700 font-medium mb-2">{rec.reason}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {rec.design.descriptionAr}
                    </p>
                    <div className="space-y-1">
                      {rec.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        درجة التوافق: {' '}
                        <span className="font-bold text-violet-700">{rec.score}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/business/apply/ai-analyze')}
            className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            إعادة التحليل
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-gray-500 hover:text-red-600 rounded-xl transition"
          >
            <X className="w-4 h-4" />
            إلغاء وخروج
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedDesignId}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            متابعة لإنشاء الموقع
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="w-6 h-6 rounded-full border border-gray-200 inline-block"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
