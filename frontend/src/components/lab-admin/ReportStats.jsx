import React from 'react';

export const ReportStats = React.memo(function ReportStats({ stats, labels }) {
  const cards = [
    { key: 'total', value: stats.totalSamples, label: labels.total, tone: 'text-slate-800' },
    { key: 'pending', value: stats.pendingReports, label: labels.pending, tone: 'text-amber-600' },
    { key: 'completed', value: stats.completedTests, label: labels.completed, tone: 'text-emerald-700' },
    { key: 'farmers', value: stats.activeFarmers, label: labels.farmers, tone: 'text-green-700' },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm transition-transform duration-150 md:hover:-translate-y-0.5"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.label}</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${c.tone}`}>{c.value}</p>
        </div>
      ))}
    </section>
  );
});
