import { Users } from 'lucide-react';
import { Audience, AUDIENCE_OPTIONS } from '@/lib/ai-wizard/types';

interface StepAudienceProps {
  value: Audience[];
  onChange: (value: Audience[]) => void;
}

export function StepAudience({ value, onChange }: StepAudienceProps) {
  const toggle = (id: Audience) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">الجمهور المستهدف</h2>
        <p className="text-gray-600">يمكنك اختيار أكثر من خيار.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AUDIENCE_OPTIONS.map((option) => {
          const selected = value.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`p-4 rounded-xl border text-right transition-all ${
                selected
                  ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.labelAr}</span>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    selected
                      ? 'bg-violet-600 border-violet-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selected && (
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7L5.5 10.5L12 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 p-3 rounded-xl">
          <Users className="w-4 h-4" />
          تم اختيار: {value.map((v) => AUDIENCE_OPTIONS.find((o) => o.id === v)?.labelAr).join('، ')}
        </div>
      )}
    </div>
  );
}
