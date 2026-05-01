import React, { useEffect, useState } from 'react';
import { Gauge, Sparkles } from 'lucide-react';
import { DEFAULT_CROP_IMAGE } from '../../data/cropImages';

export const CropHero = React.memo(function CropHero({
  imageSrc,
  displayName,
  description,
  slug,
  confidenceLabel,
  confidenceTarget,
  heroBadge,
}) {
  const [confAnim, setConfAnim] = useState(0);

  useEffect(() => {
    setConfAnim(0);
    const start = performance.now();
    const dur = 900;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 2;
      setConfAnim(Math.round(confidenceTarget * (0.08 + 0.92 * eased)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [confidenceTarget]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[280px] md:min-h-[340px]">
      <img
        src={imageSrc}
        alt={displayName}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        width="1600"
        height="800"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_CROP_IMAGE;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-900/20" />
      <div className="relative h-full min-h-[280px] md:min-h-[340px] flex flex-col justify-end p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            {heroBadge}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white border border-white/25">
            {slug.toUpperCase()}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight capitalize">{displayName}</h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-emerald-50/95 leading-relaxed">{description}</p>

        <div className="mt-6 max-w-md rounded-2xl border border-white/20 bg-black/35 px-4 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-300" />
              {confidenceLabel}
            </span>
            <span className="tabular-nums text-emerald-300">{confAnim}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300 will-change-transform"
              style={{ transform: `scaleX(${Math.max(0.05, confAnim / 100)})`, transformOrigin: 'left center' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

