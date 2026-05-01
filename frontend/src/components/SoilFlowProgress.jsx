import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const flowSteps = [
  'soilRequest',
  'labProcessing',
  'soilReport',
  'aiAnalysis',
  'cropRecommendation',
  'irrigationAdvice',
  'pestDetection',
  'marketInsights',
];

export const SoilFlowProgress = ({ currentStep }) => {
  const { t } = useLanguage();
  const currentIndex = flowSteps.indexOf(currentStep);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm">
      <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
        {t.soilWorkflow.progressLabel}
      </p>
      <div className="flex items-start overflow-x-auto gap-2 pb-1 no-scrollbar">
        {flowSteps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center min-w-[88px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                    isComplete
                      ? 'bg-green-700 border-green-700 text-white'
                      : isCurrent
                      ? 'bg-green-50 border-green-700 text-green-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={`mt-2 text-[10px] text-center font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-green-700' : 'text-slate-400'
                  }`}
                >
                  {t.soilWorkflow.steps[step]}
                </span>
              </div>
              {index < flowSteps.length - 1 && (
                <div className="w-6 md:w-8 h-px bg-slate-200 mx-1 mt-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
