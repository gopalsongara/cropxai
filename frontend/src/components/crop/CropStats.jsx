import React, { useMemo } from 'react';
import { CalendarDays, Droplets, Sprout, Tractor } from 'lucide-react';
import { cardSurfaceClass } from './CropShared';

export const CropStats = React.memo(function CropStats({ lang, crop }) {
  const stats = useMemo(
    () => [
      {
        icon: CalendarDays,
        lab: lang === 'hi' ? 'अवधि' : 'Duration',
        val: crop.duration?.[lang],
      },
      {
        icon: Droplets,
        lab: lang === 'hi' ? 'पानी' : 'Water',
        val: crop.water?.[lang],
      },
      {
        icon: Sprout,
        lab: lang === 'hi' ? 'मिट्टी' : 'Soil',
        val: crop.soil?.[lang],
      },
      {
        icon: Tractor,
        lab: lang === 'hi' ? 'सीजन' : 'Season',
        val: crop.season?.[lang],
      },
    ],
    [crop.duration, crop.water, crop.soil, crop.season, lang]
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map(({ icon: Icon, lab, val }) => (
        <div key={lab} className={`${cardSurfaceClass} p-4 flex flex-col gap-2`}>
          <Icon className="w-5 h-5 text-emerald-600" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{lab}</p>
          <p className="text-base font-bold text-slate-900 leading-snug">{val}</p>
        </div>
      ))}
    </div>
  );
});

