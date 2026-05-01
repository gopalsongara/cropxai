import React from 'react';
import { CloudRain, Droplets, Timer, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSoilWorkflow } from '../context/SoilWorkflowContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

const getWaterNeedLevel = (report) => {
  if (report.ph > 7.5 || report.potassium === 'low') return 'high';
  if (report.ph < 5.8) return 'medium';
  return 'normal';
};

export const IrrigationAdvice = () => {
  const { t } = useLanguage();
  const { selectedReport } = useSoilWorkflow();

  if (!selectedReport) {
    return (
      <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
        <SoilFlowProgress currentStep="irrigationAdvice" />
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t.soilWorkflow.irrigation.title}</h3>
          <p className="text-slate-500 mb-5">{t.soilWorkflow.irrigation.missingReport}</p>
          <Link to="/soil-report" className="inline-flex bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-semibold">
            {t.soilWorkflow.irrigation.goToReport}
          </Link>
        </div>
      </div>
    );
  }

  const waterLevel = getWaterNeedLevel(selectedReport);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.soilWorkflow.irrigation.title}</h2>
        <p className="text-slate-500 mt-2">{t.soilWorkflow.irrigation.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="irrigationAdvice" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Droplets className="w-6 h-6 text-blue-500 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.irrigation.cards.waterNeed}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.irrigation.waterNeedLevels[waterLevel]}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Timer className="w-6 h-6 text-green-600 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.irrigation.cards.frequency}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.irrigation.frequency[waterLevel]}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <CloudRain className="w-6 h-6 text-indigo-500 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.soilWorkflow.irrigation.cards.window}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.irrigation.window}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t.soilWorkflow.irrigation.recommendationsTitle}</h3>
        <div className="space-y-3">
          {t.soilWorkflow.irrigation.recommendations[waterLevel].map((tip) => (
            <div key={tip} className="flex items-start gap-3 p-3 rounded-xl bg-[#f3f7f4] border border-slate-100">
              <Waves className="w-4 h-4 text-green-700 mt-0.5" />
              <p className="text-sm text-slate-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <SoilFlowNavigation currentStep="irrigationAdvice" />
    </div>
  );
};
