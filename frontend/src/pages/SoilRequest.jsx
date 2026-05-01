import React from 'react';
import { FlaskConical, MapPin, User, Hash } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSoilWorkflow } from '../context/SoilWorkflowContext';
import { SoilFlowProgress } from '../components/SoilFlowProgress';
import { SoilFlowNavigation } from '../components/SoilFlowNavigation';

export const SoilRequest = () => {
  const { t } = useLanguage();
  const { requestDetails, updateRequestDetails } = useSoilWorkflow();

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t.soilWorkflow.request.title}</h2>
        <p className="text-slate-500 mt-2">{t.soilWorkflow.request.subtitle}</p>
      </div>

      <SoilFlowProgress currentStep="soilRequest" />

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.soilWorkflow.request.fields.sampleId}</label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={requestDetails.sampleId}
              onChange={(e) => updateRequestDetails({ sampleId: e.target.value })}
              placeholder={t.soilWorkflow.request.placeholders.sampleId}
              className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.soilWorkflow.request.fields.farmerName}</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={requestDetails.farmerName}
                onChange={(e) => updateRequestDetails({ farmerName: e.target.value })}
                placeholder={t.soilWorkflow.request.placeholders.farmerName}
                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.soilWorkflow.request.fields.village}</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={requestDetails.village}
                onChange={(e) => updateRequestDetails({ village: e.target.value })}
                placeholder={t.soilWorkflow.request.placeholders.village}
                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f3f7f4] rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
          <FlaskConical className="w-5 h-5 text-green-700 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">{t.soilWorkflow.request.note}</p>
        </div>
      </div>

      <SoilFlowNavigation currentStep="soilRequest" />
    </div>
  );
};
