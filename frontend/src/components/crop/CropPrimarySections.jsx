import React from 'react';
import { Bug, CloudSun, Droplets, FlaskConical, Leaf, Sprout, TrendingUp } from 'lucide-react';
import { FieldRow, SectionCard } from './CropShared';

function CollapsibleSection({ icon: Icon, title, children }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white shadow-sm" open>
      <summary className="cursor-pointer list-none flex items-center gap-3 p-4 md:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      </summary>
      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">{children}</div>
    </details>
  );
}

const CropPrimarySectionsComponent = ({
  cd,
  fields,
  lang,
  crop,
  overview,
  soil,
  irrig,
  dis,
  wx,
  mkt,
}) => {
  return (
    <div className="space-y-5">
      {overview ? (
        <SectionCard icon={Sprout} title={cd.overviewTitle}>
          <FieldRow k={fields.summary} v={overview.summary} />
          <FieldRow k={fields.whySuitable} v={overview.whySuitable} />
          <FieldRow k={fields.climate} v={overview.climate} />
          <FieldRow k={fields.yield} v={overview.yieldRange} />
        </SectionCard>
      ) : null}

      {soil ? (
        <SectionCard icon={FlaskConical} title={cd.soilTitle}>
          <FieldRow k={fields.soil} v={soil.soil} />
          <FieldRow k={fields.ph} v={soil.ph} />
          <FieldRow k={fields.nutrients} v={soil.nutrients} />
          <FieldRow k={fields.npk} v={soil.npk} />
        </SectionCard>
      ) : null}

      {irrig ? (
        <SectionCard icon={Droplets} title={cd.irrigationTitle}>
          <FieldRow k={fields.frequency} v={irrig.frequency} />
          <FieldRow k={fields.criticalStages} v={irrig.criticalStages} />
          <FieldRow k={fields.overwatering} v={irrig.overwatering} />
          <FieldRow k={fields.drought} v={irrig.drought} />
        </SectionCard>
      ) : null}

      {dis ? (
        <CollapsibleSection icon={Bug} title={cd.diseaseTitle}>
          <FieldRow k={fields.diseases} v={dis.diseases} />
          <FieldRow k={fields.pests} v={dis.pests} />
          <FieldRow k={fields.prevention} v={dis.prevention} />
          <FieldRow k={fields.organic} v={dis.organic} />
          <FieldRow k={fields.chemical} v={dis.chemical} />
        </CollapsibleSection>
      ) : null}

      {wx ? (
        <SectionCard icon={CloudSun} title={cd.weatherTitle}>
          <FieldRow k={fields.temp} v={wx.temp} />
          <FieldRow k={fields.rainfall} v={wx.rainfall} />
          <FieldRow k={fields.humidity} v={wx.humidity} />
          <FieldRow k={fields.seasonal} v={wx.seasonal} />
        </SectionCard>
      ) : null}

      {mkt ? (
        <CollapsibleSection icon={TrendingUp} title={cd.marketTitle}>
          <FieldRow k={fields.demand} v={mkt.demand} />
          <FieldRow k={fields.priceTrend} v={mkt.priceTrend} />
          <FieldRow k={fields.bestSeason} v={mkt.bestSeason} />
          <FieldRow k={fields.export} v={mkt.export} />
          <FieldRow k={fields.profit} v={mkt.profit} />
        </CollapsibleSection>
      ) : null}

      <SectionCard icon={Leaf} title={cd.guideTitle}>
        <FieldRow k={lang === 'hi' ? 'बुवाई' : 'Sowing'} v={crop.farmingGuide?.sowing?.[lang]} />
        <FieldRow k={lang === 'hi' ? 'सिंचाई' : 'Irrigation'} v={crop.farmingGuide?.irrigation?.[lang]} />
        <FieldRow k={lang === 'hi' ? 'उर्वरक' : 'Fertilizer'} v={crop.farmingGuide?.fertilizer?.[lang]} />
        <FieldRow k={lang === 'hi' ? 'कीट व रोग' : 'Pests'} v={crop.farmingGuide?.pests?.[lang]} />
      </SectionCard>
    </div>
  );
};

const CropPrimarySections = React.memo(CropPrimarySectionsComponent);
export default CropPrimarySections;

