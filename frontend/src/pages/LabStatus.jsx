import React from 'react';
import { Beaker, CheckCircle2, Clock3, Microscope } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

export const LabStatus = () => {
  const { t } = useLanguage();
  const statuses = t.soilWorkflow.labStatus.timeline;

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.soilWorkflow.labStatus.title}</h2>
        <p className="text-slate-500 mt-2">{t.soilWorkflow.labStatus.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="labStatus" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Clock3 className="w-6 h-6 text-amber-500 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.labStatus.metrics.etaLabel}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.labStatus.metrics.etaValue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Microscope className="w-6 h-6 text-blue-500 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.labStatus.metrics.stageLabel}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.labStatus.metrics.stageValue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Beaker className="w-6 h-6 text-green-600 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.labStatus.metrics.sampleLabel}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">SR-AI-2026</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-5">{t.soilWorkflow.labStatus.timelineTitle}</h3>
        <div className="space-y-4">
          {statuses.map((item, index) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                {index < 2 ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SoilFlowNavigation currentStep="labStatus" />
    </div>
  );
};
