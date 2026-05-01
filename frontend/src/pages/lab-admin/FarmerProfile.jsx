import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getReportsForFarmer, pickLocalizedPair } from '../../data/dummyLabReports';
import { loadLabReports } from '../../utils/labReportsStorage';
import { StatusBadge } from '../../components/lab-admin/StatusBadge';

const TEXT = {
  en: {
    back: 'Back to Dashboard',
    title: 'Farmer Profile',
    cropHistory: 'Crop History',
    pestScans: 'Pest Scans',
    recommendations: 'Recommendation Trail',
    weather: 'Weather Region',
    previousReports: 'Previous Reports',
    viewReport: 'View report',
    notFound: 'Farmer not found',
  },
  hi: {
    back: 'डैशबोर्ड पर लौटें',
    title: 'किसान प्रोफाइल',
    cropHistory: 'फसल इतिहास',
    pestScans: 'कीट स्कैन',
    recommendations: 'सिफारिश ट्रेल',
    weather: 'मौसम क्षेत्र',
    previousReports: 'पूर्व रिपोर्ट',
    viewReport: 'रिपोर्ट देखें',
    notFound: 'किसान नहीं मिला',
  },
};

export const FarmerProfile = () => {
  const { farmerKey } = useParams();
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const t = TEXT[lang];

  const reports = useMemo(() => loadLabReports(), []);
  const farmerReports = useMemo(() => getReportsForFarmer(reports, farmerKey), [reports, farmerKey]);
  const latest = farmerReports[0];

  if (!latest) {
    return <div className="p-8 text-slate-600">{t.notFound}</div>;
  }

  return (
    <div className="px-4 md:px-8 pt-5 pb-20 max-w-6xl mx-auto space-y-5">
      <Link to="/lab-dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </Link>

      <section className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="text-2xl font-bold text-slate-900">{latest.farmerName}</h2>
        <p className="text-sm text-slate-600 mt-1">{t.title}</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <p><span className="font-semibold">Phone:</span> {latest.farmerPhone}</p>
          <p><span className="font-semibold">Village:</span> {latest.village}</p>
          <p><span className="font-semibold">District:</span> {latest.district}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.cropHistory}</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {[...new Set(farmerReports.map((r) => r.crop))].map((crop) => (
              <li key={crop}>- {crop}</li>
            ))}
          </ul>
        </section>
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.pestScans}</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {farmerReports.map((r) => (
              <li key={r.id}>
                {r.date}: {r.pestDetected} ({r.pestSeverity || 'NA'})
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.recommendations}</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            {farmerReports.slice(0, 4).map((r) => (
              <li key={r.id} className="border border-slate-100 rounded-xl p-2">
                <p className="font-semibold">{r.crop} ({r.date})</p>
                <p>{pickLocalizedPair(r.recommendation?.cropSuggestions, lang)}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.weather}</h3>
          <p className="text-sm text-slate-700">{latest.weatherRegionHint}</p>
          <p className="text-sm text-slate-700 mt-1">{latest.weatherCondition}</p>
        </section>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl p-4">
        <h3 className="font-bold text-slate-900 mb-2">{t.previousReports}</h3>
        <div className="space-y-2">
          {farmerReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-3">
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{r.id} | {r.sampleId}</p>
                <p className="text-slate-600">{r.crop} - {r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                <Link to={`/lab-admin/report/${r.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">
                  {t.viewReport}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
