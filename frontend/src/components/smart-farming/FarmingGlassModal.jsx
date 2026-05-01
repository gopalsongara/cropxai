import React from 'react';
import { X } from 'lucide-react';

export const FarmingGlassModal = ({ open, title, onClose, children, subtitle }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/50 backdrop-blur-md"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[min(92vh,640px)] overflow-hidden rounded-t-[28px] sm:rounded-[24px] border border-white/60 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.25)] flex flex-col animate-[slideIn_0.22s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-slate-100/90 bg-gradient-to-r from-emerald-50/90 to-teal-50/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle ? <p className="text-xs text-slate-600 mt-1">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
};
