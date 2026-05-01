import React from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ReportTable = React.memo(function ReportTable({
  reports,
  labels,
  page,
  totalPages,
  onPageChange,
  onViewReport,
  onFarmerProfile,
  onApprove,
  onReject,
  onDownloadPdf,
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">{labels.recentSoilTests}</h3>
        <span className="text-xs font-semibold text-slate-500">{labels.queueHint}</span>
      </div>

      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-slate-50 text-left sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.sampleId}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.farmerName}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.crop}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.district}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.priority}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.status}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.date}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{labels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-slate-700">{row.sampleId}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    type="button"
                    onClick={() => onFarmerProfile(row.farmerKey)}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    {row.farmerName}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.crop}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.district}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.priority}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} label={labels.statusLabels[row.status] || row.status} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.date}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewReport(row.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {labels.viewReport}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(row.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      {labels.approve}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(row.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                    >
                      {labels.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(row.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-semibold hover:bg-emerald-50"
                    >
                      {labels.downloadPdf}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                  {labels.noResults}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
        <p>
          {labels.page} {page} / {Math.max(totalPages, 1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            {labels.prev}
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
          >
            {labels.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
});
