import { FileText } from 'lucide-react';

interface StepDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

const SUGGESTIONS = [
  'نحن شركة متخصصة في تطوير البرمجيات وتطبيقات الهاتف والتحول الرقمي.',
  'عيادة أسنان متخصصة في التقويم وتبييض الأسنان وطب الأسنان التجميلي.',
  'صالون تجميل نسائي يقدم خدمات العناية بالبشرة والشعر والمكياج.',
  'مطعم عائلي يقدم أشهى المأكولات الشرقية والغربية في أجواء مميزة.',
];

export function StepDescription({ value, onChange }: StepDescriptionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">صف نشاطك</h2>
        <p className="text-gray-600">اكتب وصفاً بسيطاً، والذكاء الاصطناعي سيتولى توسيعه لاحقاً.</p>
      </div>

      <div className="relative">
        <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="نحن شركة متخصصة في..."
          className="w-full pr-10 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div className="text-sm text-gray-500 text-left">
        {value.length} حرف
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">أمثلة للإلهام:</p>
        <div className="space-y-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(s)}
              className="block w-full text-right text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 p-2 rounded-lg transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
