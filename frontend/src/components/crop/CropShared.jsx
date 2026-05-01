import React from 'react';

export const cardSurfaceClass =
  'rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-150 md:hover:border-emerald-200';

export const pickLocalized = (block, lang) => {
  if (block == null) return null;
  if (typeof block.en === 'string') return block[lang] || block.en;
  return block[lang] || block.en;
};

export const FieldRow = React.memo(function FieldRow({ k, v }) {
  if (v == null || v === '') return null;
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">{k}</p>
      <p className="text-sm text-slate-800 leading-relaxed">{v}</p>
    </div>
  );
});

export const SectionCard = React.memo(function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className={`${cardSurfaceClass} p-4 md:p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight pt-1">{title}</h2>
      </div>
      <div className="space-y-2.5 text-sm text-slate-700">{children}</div>
    </section>
  );
});

export const RiskPill = React.memo(function RiskPill({ level, label, levelsT }) {
  const cls =
    level === 'low'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : level === 'medium'
        ? 'bg-amber-50 text-amber-950 border-amber-200'
        : 'bg-rose-50 text-rose-950 border-rose-200';
  const txt = levelsT[level] || level;
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm ${cls}`}>
      <span className="font-medium text-slate-700">{label}</span>
      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">{txt}</span>
    </div>
  );
});

