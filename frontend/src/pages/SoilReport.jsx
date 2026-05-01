import React, { useEffect } from 'react';
import { FlaskConical, MapPin, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSoilWorkflow } from '../context/SoilWorkflowContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

export const SoilReport = () => {
  const { t } = useLanguage();
  const { selectedReport, refreshReport } = useSoilWorkflow();

  useEffect(() => {
    if (!selectedReport) {
      refreshReport();
    }
  }, [selectedReport]); // keeps lab-submitted report, otherwise generates one

  if (!selectedReport) {
    return null;
  }

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.soilWorkflow.report.title}</h2>
        <p className="text-slate-500 mt-2">{t.soilWorkflow.report.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="soilReport" />

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f3f7f4] rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.soilWorkflow.report.ph}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{selectedReport.ph}</p>
          </div>
          <div className="bg-[#f3f7f4] rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.soilWorkflow.report.nitrogen}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{t.soilWorkflow.levels[selectedReport.nitrogen]}</p>
          </div>
          <div className="bg-[#f3f7f4] rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.soilWorkflow.report.phosphorus}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{t.soilWorkflow.levels[selectedReport.phosphorus]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.soilWorkflow.report.potassium}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.levels[selectedReport.potassium]}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.soilWorkflow.report.soilType}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{t.soilWorkflow.soilTypes[selectedReport.soilType]}</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-slate-100 bg-green-50/60 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-700 mt-0.5" />
          <p className="text-sm text-green-900">
            <span className="font-semibold">{t.soilWorkflow.report.region}: </span>
            {t.soilWorkflow.regions[selectedReport.region]}
          </p>
        </div>

        <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50 flex items-start gap-3">
          <Sprout className="w-5 h-5 text-green-700 mt-0.5" />
          <p className="text-sm text-slate-600">{t.soilWorkflow.report.refreshHint}</p>
        </div>

        <button
          onClick={refreshReport}
          className="w-full md:w-auto bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 inline-flex items-center gap-2"
        >
          <FlaskConical className="w-4 h-4" />
          {t.soilWorkflow.report.randomize}
        </button>
      </div>

      <SoilFlowNavigation currentStep="soilReport" />
    </div>
  );
};
