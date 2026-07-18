import { DesignPersonality, PERSONALITY_OPTIONS } from '@/lib/ai-wizard/types';

interface StepPersonalityProps {
  value: DesignPersonality;
  onChange: (value: DesignPersonality) => void;
}

export function StepPersonality({ value, onChange }: StepPersonalityProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">شخصية التصميم</h2>
        <p className="text-gray-600">اختر أسلوب الموقع الذي يعكس هوية نشاطك.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PERSONALITY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`p-4 rounded-xl border text-right transition-all ${
              value === option.id
                ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
                : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-lg mb-1">{option.labelAr}</div>
            <div className="text-sm text-gray-500">{option.descriptionAr}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
