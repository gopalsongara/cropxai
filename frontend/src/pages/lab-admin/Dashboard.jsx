import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, ShieldCheck, UserRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadLabReports, persistLabReports } from '../../utils/labReportsStorage';
import { ExportButtons } from '../../components/lab-admin/ExportButtons';
import { ReportFilters } from '../../components/lab-admin/ReportFilters';
import { ReportStats } from '../../components/lab-admin/ReportStats';
import { ReportTable } from '../../components/lab-admin/ReportTable';
import { ApprovalModal } from '../../components/lab-admin/ApprovalModal';
import { generateLabReportPDF } from '../../components/lab-admin/PDFGenerator';

const PAGE_SIZE = 6;

const COPY = {
  en: {
    title: 'Lab Admin Dashboard',
    subtitle: 'Manage soil samples, approvals, pest observations, and AI-backed recommendations.',
    stats: {
      total: 'Total Samples',
      pending: 'Pending Reports',
      completed: 'Completed Tests',
      farmers: 'Active Farmers',
    },
    filters: {
      farmerPlaceholder: 'Search by farmer name',
      sampleId: 'Sample ID',
      samplePlaceholder: 'Search sample ID',
      crop: 'Crop',
      status: 'Status',
      district: 'District',
      all: 'All',
      dateFrom: 'From',
      dateTo: 'To',
      statusLabels: {
        Pending: 'Pending',
        'In Review': 'In Review',
        Approved: 'Approved',
        Rejected: 'Rejected',
        Completed: 'Completed',
      },
    },
    table: {
      recentSoilTests: 'Recent Soil Tests',
      queueHint: 'Pending Soil Tests, Farmer Requests, Pest Reports',
      sampleId: 'Sample ID',
      farmerName: 'Farmer',
      crop: 'Crop',
      district: 'District',
      priority: 'Priority',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      viewReport: 'View Report',
      approve: 'Approve',
      reject: 'Reject',
      downloadPdf: 'PDF',
      noResults: 'No reports match selected filters.',
      page: 'Page',
      prev: 'Previous',
      next: 'Next',
      statusLabels: {
        Pending: 'Pending',
        'In Review': 'In Review',
        Approved: 'Approved',
        Rejected: 'Rejected',
        Completed: 'Completed',
      },
    },
    export: {
      exportCsv: 'Export CSV',
      exportExcel: 'Export Excel',
      exportJson: 'Export JSON',
      downloadPdf: 'Download PDF',
      sampleId: 'Sample ID',
      farmerName: 'Farmer',
      crop: 'Crop',
      status: 'Status',
      date: 'Date',
    },
    modal: {
      rejectTitle: 'Reject Report',
      approveTitle: 'Approve Report',
      subtitle: 'Record your review remarks for traceability.',
      rejectionReason: 'Rejection Reason',
      approvalRemarks: 'Approval Remarks',
      reasonPlaceholder: 'Sample contaminated / missing data / ...',
      approvePlaceholder: 'Approved after QA cross-check',
      comments: 'Comments',
      commentPlaceholder: 'Optional detailed notes for this action',
      cancel: 'Cancel',
      reject: 'Reject',
      approve: 'Approve',
    },
    toasts: {
      approved: 'Report approved successfully',
      rejected: 'Report rejected successfully',
      downloaded: 'PDF downloaded and history updated',
    },
    highlights: {
      approval: 'Report Approval Queue',
      approvalDesc: 'Approve or reject report batches to maintain quality standards.',
      farmer: 'Farmer Profile View',
      farmerDesc: 'Track crop history, pest scans, and recommendation trails.',
      sample: 'Sample Collection Monitoring',
      sampleDesc: 'Monitor pending pickups, in-lab processing, and turnaround time.',
    },
  },
  hi: {
    title: 'लैब एडमिन डैशबोर्ड',
    subtitle: 'मृदा नमूने, अनुमोदन, कीट अवलोकन और एआई सिफारिशें प्रबंधित करें।',
    stats: {
      total: 'कुल नमूने',
      pending: 'लंबित रिपोर्ट',
      completed: 'पूर्ण परीक्षण',
      farmers: 'सक्रिय किसान',
    },
    filters: {
      farmerPlaceholder: 'किसान नाम से खोजें',
      sampleId: 'सैंपल आईडी',
      samplePlaceholder: 'सैंपल आईडी खोजें',
      crop: 'फसल',
      status: 'स्थिति',
      district: 'जिला',
      all: 'सभी',
      dateFrom: 'से',
      dateTo: 'तक',
      statusLabels: {
        Pending: 'लंबित',
        'In Review': 'समीक्षा में',
        Approved: 'स्वीकृत',
        Rejected: 'अस्वीकृत',
        Completed: 'पूर्ण',
      },
    },
    table: {
      recentSoilTests: 'हालिया मृदा परीक्षण',
      queueHint: 'लंबित परीक्षण, किसान अनुरोध, कीट रिपोर्ट',
      sampleId: 'सैंपल आईडी',
      farmerName: 'किसान',
      crop: 'फसल',
      district: 'जिला',
      priority: 'प्राथमिकता',
      status: 'स्थिति',
      date: 'तारीख',
      actions: 'कार्य',
      viewReport: 'रिपोर्ट देखें',
      approve: 'स्वीकृत',
      reject: 'अस्वीकृत',
      downloadPdf: 'पीडीएफ',
      noResults: 'चयनित फिल्टर से कोई रिपोर्ट नहीं मिली।',
      page: 'पेज',
      prev: 'पिछला',
      next: 'अगला',
      statusLabels: {
        Pending: 'लंबित',
        'In Review': 'समीक्षा में',
        Approved: 'स्वीकृत',
        Rejected: 'अस्वीकृत',
        Completed: 'पूर्ण',
      },
    },
    export: {
      exportCsv: 'CSV एक्सपोर्ट',
      exportExcel: 'Excel एक्सपोर्ट',
      exportJson: 'JSON एक्सपोर्ट',
      downloadPdf: 'PDF डाउनलोड',
      sampleId: 'सैंपल आईडी',
      farmerName: 'किसान',
      crop: 'फसल',
      status: 'स्थिति',
      date: 'तारीख',
    },
    modal: {
      rejectTitle: 'रिपोर्ट अस्वीकृत करें',
      approveTitle: 'रिपोर्ट स्वीकृत करें',
      subtitle: 'ट्रेसबिलिटी के लिए समीक्षा टिप्पणी दर्ज करें।',
      rejectionReason: 'अस्वीकृति कारण',
      approvalRemarks: 'स्वीकृति टिप्पणी',
      reasonPlaceholder: 'नमूना दूषित / डेटा अधूरा / ...',
      approvePlaceholder: 'QA जांच के बाद स्वीकृत',
      comments: 'टिप्पणी',
      commentPlaceholder: 'वैकल्पिक विस्तृत नोट्स',
      cancel: 'रद्द',
      reject: 'अस्वीकृत',
      approve: 'स्वीकृत',
    },
    toasts: {
      approved: 'रिपोर्ट सफलतापूर्वक स्वीकृत हुई',
      rejected: 'रिपोर्ट सफलतापूर्वक अस्वीकृत हुई',
      downloaded: 'PDF डाउनलोड हुआ और इतिहास अपडेट हो गया',
    },
    highlights: {
      approval: 'रिपोर्ट अनुमोदन कतार',
      approvalDesc: 'गुणवत्ता मानकों के लिए रिपोर्ट बैच स्वीकृत/अस्वीकृत करें।',
      farmer: 'किसान प्रोफाइल दृश्य',
      farmerDesc: 'फसल इतिहास, कीट स्कैन और सिफारिश ट्रेल देखें।',
      sample: 'नमूना संग्रह निगरानी',
      sampleDesc: 'लंबित पिकअप, लैब प्रोसेसिंग और टर्नअराउंड देखें।',
    },
  },
};

function nowIso() {
  return new Date().toISOString();
}

function updateTimelineForStatus(report, status) {
  const timeline = Array.isArray(report.timeline) ? [...report.timeline] : [];
  const markDone = (key) => {
    const idx = timeline.findIndex((t) => t.key === key);
    if (idx >= 0) {
      timeline[idx] = { ...timeline[idx], done: true, at: timeline[idx].at || nowIso() };
    }
  };
  if (status === 'In Review') markDone('testing');
  if (status === 'Approved' || status === 'Completed') {
    markDone('testing');
    markDone('reviewed');
    markDone('approved');
  }
  if (status === 'Rejected') {
    markDone('testing');
    markDone('reviewed');
  }
  return timeline;
}

export const Dashboard = () => {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const copy = COPY[lang];
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    sampleSearch: '',
    crop: '',
    status: '',
    district: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(loadLabReports());
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const districts = useMemo(
    () => [...new Set(reports.map((r) => r.district))].sort((a, b) => a.localeCompare(b)),
    [reports]
  );

  const statuses = useMemo(
    () => ['Pending', 'In Review', 'Approved', 'Rejected', 'Completed'],
    []
  );

  const filteredReports = useMemo(() => {
    const f = filters;
    return reports.filter((r) => {
      const farmerMatch = r.farmerName.toLowerCase().includes(f.search.trim().toLowerCase());
      const sampleMatch = r.sampleId.toLowerCase().includes(f.sampleSearch.trim().toLowerCase());
      const cropMatch = !f.crop || r.crop === f.crop;
      const statusMatch = !f.status || r.status === f.status;
      const districtMatch = !f.district || r.district === f.district;
      const fromMatch = !f.dateFrom || r.date >= f.dateFrom;
      const toMatch = !f.dateTo || r.date <= f.dateTo;
      return farmerMatch && sampleMatch && cropMatch && statusMatch && districtMatch && fromMatch && toMatch;
    });
  }, [reports, filters]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === 'Pending' || r.status === 'In Review').length;
    const completed = reports.filter((r) => r.status === 'Completed' || r.status === 'Approved').length;
    return {
      totalSamples: reports.length,
      pendingReports: pending,
      completedTests: completed,
      activeFarmers: new Set(reports.map((item) => item.farmerKey)).size,
    };
  }, [reports]);

  const updateReportState = (nextReports) => {
    setReports(nextReports);
    persistLabReports(nextReports);
  };

  const setStatus = (id, status, remarks = '') => {
    const next = reports.map((r) => {
      if (r.id !== id) return r;
      const action = status === 'Rejected' ? 'rejected' : 'approved';
      return {
        ...r,
        status,
        rejectionRemarks: status === 'Rejected' ? remarks : '',
        timeline: updateTimelineForStatus(r, status),
        activityLog: [
          ...(Array.isArray(r.activityLog) ? r.activityLog : []),
          {
            action,
            at: nowIso(),
            noteEn: remarks || `${status} by lab admin`,
            noteHi: remarks || `लैब एडमिन द्वारा ${status}`,
          },
        ],
      };
    });
    updateReportState(next);
    setToast(status === 'Rejected' ? copy.toasts.rejected : copy.toasts.approved);
  };

  const onDownloadSinglePdf = async (id) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    await generateLabReportPDF(report, lang);
    const next = reports.map((r) =>
      r.id !== id
        ? r
        : {
            ...r,
            activityLog: [
              ...(Array.isArray(r.activityLog) ? r.activityLog : []),
              {
                action: 'downloaded',
                at: nowIso(),
                noteEn: 'PDF downloaded from dashboard',
                noteHi: 'डैशबोर्ड से PDF डाउनलोड',
              },
            ],
          }
    );
    updateReportState(next);
    setToast(copy.toasts.downloaded);
  };

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.sampleSearch, filters.crop, filters.status, filters.district, filters.dateFrom, filters.dateTo]);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{copy.title}</h2>
          <p className="text-slate-500 mt-2">{copy.subtitle}</p>
        </div>
        <ExportButtons reports={filteredReports} labels={copy.export} language={lang} />
      </div>

      <ReportStats stats={stats} labels={copy.stats} />

      <ReportFilters
        {...filters}
        districts={districts}
        statuses={statuses}
        labels={copy.filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
      />

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6 space-y-3 animate-pulse">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded" />
        </div>
      ) : (
        <ReportTable
          reports={paginatedReports}
          labels={copy.table}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewReport={(id) => navigate(`/lab-admin/report/${id}`)}
          onFarmerProfile={(farmerKey) => navigate(`/lab-admin/farmer/${farmerKey}`)}
          onApprove={(id) => setStatus(id, 'Approved', 'Approved after lab QA review')}
          onReject={setRejectTargetId}
          onDownloadPdf={onDownloadSinglePdf}
        />
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#f3f7f4] border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-green-700 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">{copy.highlights.approval}</p>
            <p className="text-sm text-slate-600 mt-1">{copy.highlights.approvalDesc}</p>
          </div>
        </div>
        <div className="bg-[#f3f7f4] border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <UserRound className="w-5 h-5 text-green-700 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">{copy.highlights.farmer}</p>
            <p className="text-sm text-slate-600 mt-1">{copy.highlights.farmerDesc}</p>
          </div>
        </div>
        <div className="bg-[#f3f7f4] border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <Clock3 className="w-5 h-5 text-green-700 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">{copy.highlights.sample}</p>
            <p className="text-sm text-slate-600 mt-1">{copy.highlights.sampleDesc}</p>
          </div>
        </div>
      </section>

      <ApprovalModal
        open={Boolean(rejectTargetId)}
        mode="reject"
        labels={copy.modal}
        onClose={() => setRejectTargetId('')}
        onSubmit={(payload) => {
          if (rejectTargetId) setStatus(rejectTargetId, 'Rejected', payload.remarks);
          setRejectTargetId('');
        }}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm shadow-xl z-50">
          {toast}
        </div>
      ) : null}
    </div>
  );
};
