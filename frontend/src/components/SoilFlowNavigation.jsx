import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const soilFlowRoutes = ['soilRequest', 'labProcessing', 'soilReport', 'aiAnalysis', 'irrigationAdvice'];

const routeMap = {
  soilRequest: '/soil-request',
  labProcessing: '/lab-processing',
  soilReport: '/soil-report',
  aiAnalysis: '/ai-analysis',
  irrigationAdvice: '/irrigation-advice',
};

export const SoilFlowNavigation = ({ currentStep, className = '' }) => {
  const { t } = useLanguage();
  const currentIndex = soilFlowRoutes.indexOf(currentStep);

  if (currentIndex === -1) {
    return null;
  }

  const previousStep = currentIndex > 0 ? soilFlowRoutes[currentIndex - 1] : null;
  const nextStep = currentIndex < soilFlowRoutes.length - 1 ? soilFlowRoutes[currentIndex + 1] : null;

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:justify-end ${className}`}>
      {previousStep && (
        <Link
          to={routeMap[previousStep]}
          className="w-full sm:w-auto sm:min-w-[180px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.soilWorkflow.navigation.back}
        </Link>
      )}
      {nextStep && (
        <Link
          to={routeMap[nextStep]}
          className="w-full sm:w-auto sm:min-w-[180px] bg-green-700 hover:bg-green-800 text-white py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {t.soilWorkflow.navigation.next}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};
