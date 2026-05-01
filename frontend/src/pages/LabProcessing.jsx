import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

const processingMessageKeys = ['analyzingNutrients', 'testingPh', 'generatingReport'];

export const LabProcessing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);

  const processingTimeMs = useMemo(() => 2000 + Math.floor(Math.random() * 2001), []);
  const currentMessage = t.labProcessing.messages[processingMessageKeys[messageIndex]];

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % processingMessageKeys.length);
    }, 900);

    const completionTimer = setTimeout(() => {
      navigate('/soil-report');
    }, processingTimeMs);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(completionTimer);
    };
  }, [navigate, processingTimeMs]);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.labProcessing.title}</h2>
        <p className="text-slate-500 mt-2">{t.labProcessing.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="labProcessing" />

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 p-3">
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
            <span className="font-semibold text-green-800">{t.labProcessing.steps.sampleCollected}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
            <LoaderCircle className="w-5 h-5 text-blue-700 animate-spin shrink-0" />
            <span className="font-semibold text-blue-800">{t.labProcessing.steps.labTesting}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="font-semibold text-slate-500">{t.labProcessing.steps.reportGeneration}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="font-semibold text-slate-500">{t.labProcessing.steps.completed}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-[#f3f7f4] p-5 text-center">
          <p className="text-sm md:text-base font-semibold text-slate-700">{currentMessage}</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-bounce" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      <SoilFlowNavigation currentStep="labProcessing" />
    </div>
  );
};
