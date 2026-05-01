import React from 'react';
import { Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSoilWorkflow } from '../context/SoilWorkflowContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

const getAnalysisKeys = (report) => {
  const alerts = [];
  const positives = [];

  if (report.nitrogen === 'low') alerts.push('lowNitrogen');
  if (report.nitrogen === 'high') positives.push('highNitrogen');
  if (report.phosphorus === 'low') alerts.push('lowPhosphorus');
  if (report.potassium === 'low') alerts.push('lowPotassium');

  if (report.ph > 7.5) alerts.push('highPh');
  else if (report.ph < 5.8) alerts.push('lowPh');
  else positives.push('balancedPh');

  if (alerts.length === 0) alerts.push('noCriticalAlert');
  return { alerts, positives };
};

export const AiAnalysis = () => {
  const { t } = useLanguage();
  const { selectedReport } = useSoilWorkflow();

  if (!selectedReport) {
    return (
      <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
        <SoilFlowProgress currentStep="aiAnalysis" />
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t.soilWorkflow.aiAnalysis.title}</h3>
          <p className="text-slate-500 mb-5">{t.soilWorkflow.aiAnalysis.missingReport}</p>
          <Link to="/soil-report" className="inline-flex bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-semibold">
            {t.soilWorkflow.aiAnalysis.goToReport}
          </Link>
        </div>
      </div>
    );
  }

  const { alerts, positives } = getAnalysisKeys(selectedReport);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.soilWorkflow.aiAnalysis.title}</h2>
        <p className="text-slate-500 mt-2">{t.soilWorkflow.aiAnalysis.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="aiAnalysis" />

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{t.soilWorkflow.aiAnalysis.heading}</h3>
        </div>

        <div className="space-y-4">
          {alerts.map((key) => (
            <div key={key} className="rounded-2xl p-4 border border-amber-100 bg-amber-50/70 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900">{t.soilWorkflow.aiAnalysis.messages[key]}</p>
            </div>
          ))}

          {positives.map((key) => (
            <div key={key} className="rounded-2xl p-4 border border-green-100 bg-green-50/70 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-700 mt-0.5" />
              <p className="text-sm text-green-900">{t.soilWorkflow.aiAnalysis.messages[key]}</p>
            </div>
          ))}
        </div>
      </div>

      <SoilFlowNavigation currentStep="aiAnalysis" />
    </div>
  );
};
