import React from 'react';

const styles = {
  Pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  'In Review': 'bg-blue-100 text-blue-800 ring-blue-200',
  Approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  Completed: 'bg-green-100 text-green-800 ring-green-200',
};

export const StatusBadge = React.memo(function StatusBadge({ status, label }) {
  const cls = styles[status] || 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${cls}`}
    >
      {label || status}
    </span>
  );
});
