import React from 'react';
import { Search } from 'lucide-react';

const CROPS = ['', 'Wheat', 'Rice', 'Cotton', 'Soybean', 'Mustard', 'Sugarcane', 'Maize'];

export const ReportFilters = React.memo(function ReportFilters({
  search,
  sampleSearch,
  crop,
  status,
  district,
  dateFrom,
  dateTo,
  districts,
  statuses,
  labels,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <label className="relative flex items-center md:col-span-2">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={labels.farmerPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.sampleId}</span>
          <input
            type="search"
            value={sampleSearch}
            onChange={(e) => onChange({ sampleSearch: e.target.value })}
            placeholder={labels.samplePlaceholder}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.crop}</span>
          <select
            value={crop}
            onChange={(e) => onChange({ crop: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">{labels.all}</option>
            {CROPS.filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.status}</span>
          <select
            value={status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">{labels.all}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {labels.statusLabels?.[s] || s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.district}</span>
          <select
            value={district}
            onChange={(e) => onChange({ district: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">{labels.all}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.dateFrom}</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-[11px] font-bold uppercase text-slate-500">{labels.dateTo}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </label>
      </div>
    </div>
  );
});
