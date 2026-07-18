import { motion } from 'framer-motion';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function WizardProgress({ currentStep, totalSteps, labels }: WizardProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Desktop step labels */}
      <div className="hidden sm:flex justify-between mb-3">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          return (
            <div
              key={stepNumber}
              className={`flex flex-col items-center gap-2 transition-colors ${
                isActive ? 'text-violet-600' : isCompleted ? 'text-violet-400' : 'text-gray-400'
              }`}
            >
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-violet-600 to-fuchsia-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Mobile step counter */}
      <div className="sm:hidden mt-3 text-center">
        <span className="text-sm text-gray-600">
          الخطوة {currentStep} من {totalSteps}: {labels[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
