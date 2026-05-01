import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getPestReportById } from '../data/pestReports';

const severityClass = (key) => {
  const normalized = String(key || '').toLowerCase();
  if (normalized === 'high') return 'bg-red-100 text-red-700';
  if (normalized === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

export const PestReport = () => {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedReport = getPestReportById(id);
  const scanData = location.state?.scan || {};
  const reportImage = scanData?.imageUrl || selectedReport.image;
  const isHindi = language === 'hi';

  const tx = {
    title: isHindi ? 'विस्तृत रोग रिपोर्ट' : 'Detailed Disease Report',
    confidence: isHindi ? 'विश्वास स्तर' : 'Confidence',
    crop: isHindi ? 'फसल' : 'Crop',
    symptoms: isHindi ? 'लक्षण' : 'Symptoms',
    causes: isHindi ? 'कारण' : 'Causes',
    treatment: isHindi ? 'उपचार' : 'Treatment',
    prevention: isHindi ? 'रोकथाम' : 'Prevention',
    organic: isHindi ? 'जैविक समाधान' : 'Organic Solution',
    chemical: isHindi ? 'रासायनिक समाधान' : 'Chemical Solution',
    recommendation: isHindi ? 'किसान सुझाव' : 'Farmer Recommendation',
    back: isHindi ? 'वापस जाएं' : 'Go Back',
    download: isHindi ? 'रिपोर्ट डाउनलोड करें' : 'Download Report PDF',
  };

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/pest-detection')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tx.back}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          {tx.download}
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <img
          src={reportImage}
          alt={selectedReport.disease[language] || selectedReport.disease.en}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{tx.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {selectedReport.disease[language] || selectedReport.disease.en}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${severityClass(selectedReport.severity.key)}`}>
              {selectedReport.severity[language] || selectedReport.severity.en}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              {tx.crop}: {selectedReport.crop[language] || selectedReport.crop.en}
            </span>
            <span className="rounded-lg bg-green-100 px-3 py-1 font-semibold text-green-700">
              {tx.confidence}: {scanData?.confidence ?? selectedReport.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-2">{tx.symptoms}</h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            {(selectedReport.symptoms[language] || selectedReport.symptoms.en).map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-2">{tx.causes}</h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            {(selectedReport.causes[language] || selectedReport.causes.en).map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-2">{tx.treatment}</h2>
          <p className="text-slate-700 text-sm">{selectedReport.treatment[language] || selectedReport.treatment.en}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-2">{tx.prevention}</h2>
          <p className="text-slate-700 text-sm">{selectedReport.prevention[language] || selectedReport.prevention.en}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-green-50 border border-green-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-green-700 mb-2">{tx.organic}</h2>
          <p className="text-green-900 text-sm">{selectedReport.organic[language] || selectedReport.organic.en}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-amber-700 mb-2">{tx.chemical}</h2>
          <p className="text-amber-900 text-sm">{selectedReport.chemical[language] || selectedReport.chemical.en}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-700 p-5 text-white shadow-sm">
        <h2 className="text-sm font-bold uppercase text-green-100 mb-2">{tx.recommendation}</h2>
        <p className="text-sm">{selectedReport.recommendation[language] || selectedReport.recommendation.en}</p>
      </div>
    </section>
  );
};
