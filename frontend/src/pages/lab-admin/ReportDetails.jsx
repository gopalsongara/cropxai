import React, { useMemo, useState } from 'react';
import { ArrowLeft, Download, UserRound } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { loadLabReports, persistLabReports } from '../../utils/labReportsStorage';
import { ApprovalModal } from '../../components/lab-admin/ApprovalModal';
import { StatusBadge } from '../../components/lab-admin/StatusBadge';
import { generateLabReportPDF } from '../../components/lab-admin/PDFGenerator';
import { pickLocalizedPair } from '../../data/dummyLabReports';

const TEXT = {
  en: {
    back: 'Back to Dashboard',
    farmerDetails: 'Farmer Details',
    cropInfo: 'Crop Information',
    soilAnalysis: 'Soil Analysis',
    pestDisease: 'Pest & Disease',
    aiRec: 'AI Recommendations',
    timeline: 'Lab Status Timeline',
    activity: 'Activity History',
    notes: 'Technician Notes',
    approve: 'Approve',
    reject: 'Reject',
    downloadPdf: 'Download PDF',
    farmerProfile: 'Open Farmer Profile',
    notFound: 'Report not found',
    labels: {
      phone: 'Phone',
      village: 'Village',
      district: 'District',
      crop: 'Crop',
      soilType: 'Soil Type',
      weather: 'Weather Condition',
      ph: 'pH',
      nitrogen: 'Nitrogen',
      phosphorus: 'Phosphorus',
      potassium: 'Potassium',
      moisture: 'Moisture',
      organicCarbon: 'Organic Carbon',
      pestDetected: 'Pest Detected',
      severity: 'Severity',
      diseaseRisk: 'Disease Risk',
      fertilizers: 'Fertilizers',
      irrigation: 'Irrigation',
      pesticides: 'Pesticides',
      cropSuggestions: 'Crop Suggestions',
      status: 'Status',
      sampleId: 'Sample ID',
      date: 'Date',
      technician: 'Lab Technician',
      priority: 'Priority',
      noActivity: 'No activity yet.',
    },
    modal: {
      rejectTitle: 'Reject Report',
      approveTitle: 'Approve Report',
      subtitle: 'Save action remarks for audit trail.',
      rejectionReason: 'Reason',
      approvalRemarks: 'Approval Remarks',
      reasonPlaceholder: 'Why is this report rejected?',
      approvePlaceholder: 'Approved after verification',
      comments: 'Comments',
      commentPlaceholder: 'Optional detailed comments',
      cancel: 'Cancel',
      reject: 'Reject',
      approve: 'Approve',
    },
  },
  hi: {
    back: 'डैशबोर्ड पर लौटें',
    farmerDetails: 'किसान विवरण',
    cropInfo: 'फसल जानकारी',
    soilAnalysis: 'मृदा विश्लेषण',
    pestDisease: 'कीट और रोग',
    aiRec: 'एआई सिफारिशें',
    timeline: 'लैब स्थिति टाइमलाइन',
    activity: 'गतिविधि इतिहास',
    notes: 'तकनीशियन नोट्स',
    approve: 'स्वीकृत',
    reject: 'अस्वीकृत',
    downloadPdf: 'PDF डाउनलोड',
    farmerProfile: 'किसान प्रोफाइल खोलें',
    notFound: 'रिपोर्ट नहीं मिली',
    labels: {
      phone: 'फोन',
      village: 'गांव',
      district: 'जिला',
      crop: 'फसल',
      soilType: 'मिट्टी प्रकार',
      weather: 'मौसम स्थिति',
      ph: 'pH',
      nitrogen: 'नाइट्रोजन',
      phosphorus: 'फॉस्फोरस',
      potassium: 'पोटैशियम',
      moisture: 'नमी',
      organicCarbon: 'जैविक कार्बन',
      pestDetected: 'कीट',
      severity: 'तीव्रता',
      diseaseRisk: 'रोग जोखिम',
      fertilizers: 'उर्वरक',
      irrigation: 'सिंचाई',
      pesticides: 'कीटनाशक',
      cropSuggestions: 'फसल सुझाव',
      status: 'स्थिति',
      sampleId: 'सैंपल आईडी',
      date: 'तारीख',
      technician: 'लैब तकनीशियन',
      priority: 'प्राथमिकता',
      noActivity: 'अभी कोई गतिविधि नहीं।',
    },
    modal: {
      rejectTitle: 'रिपोर्ट अस्वीकृत करें',
      approveTitle: 'रिपोर्ट स्वीकृत करें',
      subtitle: 'ऑडिट ट्रेल के लिए टिप्पणी सहेजें।',
      rejectionReason: 'कारण',
      approvalRemarks: 'स्वीकृति टिप्पणी',
      reasonPlaceholder: 'रिपोर्ट अस्वीकृत क्यों है?',
      approvePlaceholder: 'सत्यापन के बाद स्वीकृत',
      comments: 'टिप्पणी',
      commentPlaceholder: 'वैकल्पिक टिप्पणी',
      cancel: 'रद्द',
      reject: 'अस्वीकृत',
      approve: 'स्वीकृत',
    },
  },
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

function updateStatus(report, status, remarks = '') {
  const timeline = Array.isArray(report.timeline) ? [...report.timeline] : [];
  const mark = (key) => {
    const idx = timeline.findIndex((t) => t.key === key);
    if (idx >= 0) timeline[idx] = { ...timeline[idx], done: true, at: timeline[idx].at || new Date().toISOString() };
  };
  if (status === 'Rejected') {
    mark('testing');
    mark('reviewed');
  } else if (status === 'Approved' || status === 'Completed') {
    mark('testing');
    mark('reviewed');
    mark('approved');
  }
  return {
    ...report,
    status,
    rejectionRemarks: status === 'Rejected' ? remarks : '',
    timeline,
    activityLog: [
      ...(report.activityLog || []),
      {
        action: status === 'Rejected' ? 'rejected' : 'approved',
        at: new Date().toISOString(),
        noteEn: remarks || `${status} from report page`,
        noteHi: remarks || `रिपोर्ट पेज से ${status}`,
      },
    ],
  };
}

export const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const t = TEXT[lang];

  const [reports, setReports] = useState(() => loadLabReports());
  const [showReject, setShowReject] = useState(false);
  const report = useMemo(() => reports.find((item) => item.id === id), [id, reports]);

  if (!report) {
    return <div className="p-8 text-slate-600">{t.notFound}</div>;
  }

  const saveNext = (nextReport) => {
    const nextReports = reports.map((r) => (r.id === nextReport.id ? nextReport : r));
    setReports(nextReports);
    persistLabReports(nextReports);
  };

  const rec = report.recommendation || {};

  return (
    <div className="px-4 md:px-8 pt-5 pb-20 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate('/lab-dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{report.id}</h2>
          <p className="text-sm text-slate-500">
            {t.labels.sampleId}: {report.sampleId} | {t.labels.date}: {report.date}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={report.status} />
          <button
            type="button"
            onClick={() => saveNext(updateStatus(report, 'Approved', 'Approved after detail review'))}
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            {t.approve}
          </button>
          <button
            type="button"
            onClick={() => setShowReject(true)}
            className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
          >
            {t.reject}
          </button>
          <button
            type="button"
            onClick={async () => {
              await generateLabReportPDF(report, lang);
              saveNext({
                ...report,
                activityLog: [
                  ...(report.activityLog || []),
                  {
                    action: 'downloaded',
                    at: new Date().toISOString(),
                    noteEn: 'Downloaded from details page',
                    noteHi: 'डिटेल पेज से डाउनलोड',
                  },
                ],
              });
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
          >
            <Download className="w-4 h-4" />
            {t.downloadPdf}
          </button>
          <Link
            to={`/lab-admin/farmer/${report.farmerKey}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            <UserRound className="w-4 h-4" />
            {t.farmerProfile}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-100 rounded-2xl p-4 space-y-1">
          <h3 className="font-bold text-slate-900">{t.farmerDetails}</h3>
          <p>{report.farmerName}</p>
          <p className="text-sm text-slate-600">{t.labels.phone}: {report.farmerPhone}</p>
          <p className="text-sm text-slate-600">{t.labels.village}: {report.village}</p>
          <p className="text-sm text-slate-600">{t.labels.district}: {report.district}</p>
        </section>
        <section className="bg-white border border-slate-100 rounded-2xl p-4 space-y-1">
          <h3 className="font-bold text-slate-900">{t.cropInfo}</h3>
          <p className="text-sm text-slate-700">{t.labels.crop}: {report.crop}</p>
          <p className="text-sm text-slate-700">{t.labels.soilType}: {report.soilType}</p>
          <p className="text-sm text-slate-700">{t.labels.weather}: {report.weatherCondition}</p>
          <p className="text-sm text-slate-700">{t.labels.technician}: {report.labTechnician}</p>
          <p className="text-sm text-slate-700">{t.labels.priority}: {report.priority}</p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.soilAnalysis}</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>{t.labels.ph}: {report.soilPH}</li>
            <li>{t.labels.nitrogen}: {report.nitrogen}</li>
            <li>{t.labels.phosphorus}: {report.phosphorus}</li>
            <li>{t.labels.potassium}: {report.potassium}</li>
            <li>{t.labels.moisture}: {report.moisture}</li>
            <li>{t.labels.organicCarbon}: {report.organicCarbon}</li>
          </ul>
        </section>
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.pestDisease}</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>{t.labels.pestDetected}: {report.pestDetected}</li>
            <li>{t.labels.severity}: {report.pestSeverity || '-'}</li>
            <li>{t.labels.diseaseRisk}: {report.diseaseRisk}</li>
            <li>{t.labels.status}: <StatusBadge status={report.status} /></li>
          </ul>
        </section>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl p-4">
        <h3 className="font-bold text-slate-900 mb-2">{t.aiRec}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
          <p><span className="font-semibold">{t.labels.fertilizers}: </span>{pickLocalizedPair(rec.fertilizers, lang)}</p>
          <p><span className="font-semibold">{t.labels.irrigation}: </span>{pickLocalizedPair(rec.irrigation, lang)}</p>
          <p><span className="font-semibold">{t.labels.pesticides}: </span>{pickLocalizedPair(rec.pesticides, lang)}</p>
          <p><span className="font-semibold">{t.labels.cropSuggestions}: </span>{pickLocalizedPair(rec.cropSuggestions, lang)}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.timeline}</h3>
          <div className="space-y-2">
            {(report.timeline || []).map((item) => (
              <div key={item.key} className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{lang === 'hi' ? item.labelHi : item.labelEn}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(item.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white border border-slate-100 rounded-2xl p-4">
          <h3 className="font-bold text-slate-900 mb-2">{t.activity}</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {(report.activityLog || []).length === 0 ? (
              <p className="text-sm text-slate-500">{t.labels.noActivity}</p>
            ) : (
              (report.activityLog || []).slice().reverse().map((log, idx) => (
                <div key={`${log.action}-${idx}`} className="text-sm border border-slate-100 rounded-xl p-2">
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <p className="text-slate-600">{lang === 'hi' ? log.noteHi : log.noteEn}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(log.at)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl p-4">
        <h3 className="font-bold text-slate-900 mb-1">{t.notes}</h3>
        <p className="text-sm text-slate-700">{report.notes}</p>
        {report.rejectionRemarks ? <p className="text-sm text-rose-700 mt-2">{report.rejectionRemarks}</p> : null}
      </section>

      <ApprovalModal
        open={showReject}
        mode="reject"
        labels={t.modal}
        onClose={() => setShowReject(false)}
        onSubmit={(payload) => {
          saveNext(updateStatus(report, 'Rejected', payload.remarks));
          setShowReject(false);
        }}
      />
    </div>
  );
};
