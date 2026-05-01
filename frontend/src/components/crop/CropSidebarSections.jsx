import React from 'react';
import { AlertTriangle, BarChart3, Brain, CalendarClock, Coins, Leaf } from 'lucide-react';
import { FieldRow, RiskPill, SectionCard, cardSurfaceClass } from './CropShared';

const CropSidebarSectionsComponent = ({
  cd,
  fields,
  aiReco,
  risks,
  levelsT,
  timeline,
  organic,
  yieldP,
  profit,
}) => {
  return (
    <div className="space-y-5">
      {aiReco ? (
        <section className={`${cardSurfaceClass} p-4 md:p-5 bg-emerald-50/60`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Brain className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">{cd.smartRecoTitle}</h2>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">{aiReco}</p>
        </section>
      ) : null}

      {risks ? (
        <section className={`${cardSurfaceClass} p-4 md:p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">{cd.riskTitle}</h2>
          </div>
          <div className="space-y-2">
            {(['disease', 'water', 'fertilizer', 'weather']).map((key) => (
              <RiskPill key={key} level={risks[key]} label={cd.riskKeys[key]} levelsT={levelsT} />
            ))}
          </div>
        </section>
      ) : null}

      {Array.isArray(timeline) && timeline.length > 0 ? (
        <details className={`${cardSurfaceClass} p-4 md:p-5`} open={false}>
          <summary className="cursor-pointer list-none flex items-center gap-2 font-bold text-slate-900">
            <CalendarClock className="w-5 h-5 text-violet-600" />
            {cd.timelineTitle}
          </summary>
          <ul className="mt-3 space-y-2.5">
            {timeline.map((step, i) => (
              <li key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                <p className="text-sm font-semibold text-slate-900">{i + 1}. {step.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.detail}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {Array.isArray(organic) && organic.length > 0 ? (
        <details className={`${cardSurfaceClass} p-4 md:p-5`} open={false}>
          <summary className="cursor-pointer list-none flex items-center gap-2 font-bold text-slate-900">
            <Leaf className="w-5 h-5 text-lime-600" />
            {cd.organicTitle}
          </summary>
          <ul className="mt-3 space-y-1.5">
            {organic.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 font-bold">●</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {yieldP ? (
        <SectionCard icon={BarChart3} title={cd.yieldTitle}>
          <FieldRow k={fields.production} v={yieldP.production} />
          <FieldRow k={fields.quality} v={yieldP.quality} />
          <FieldRow k={fields.duration} v={yieldP.duration} />
        </SectionCard>
      ) : null}

      {profit ? (
        <SectionCard icon={Coins} title={cd.profitTitle}>
          <FieldRow k={fields.income} v={profit.income} />
          <FieldRow k={fields.investment} v={profit.investment} />
          <FieldRow k={fields.stability} v={profit.stability} />
        </SectionCard>
      ) : null}
    </div>
  );
};

const CropSidebarSections = React.memo(CropSidebarSectionsComponent);
export default CropSidebarSections;

