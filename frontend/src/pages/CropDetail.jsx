import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_CROP_IMAGE, getCropImage } from '../data/cropImages';
import { getCropInsights } from '../data/cropInsightContent';
import { pickLocalized } from '../components/crop/CropShared';
import { CropHero } from '../components/crop/CropHero';
import { CropStats } from '../components/crop/CropStats';
import { CropSkeleton } from '../components/crop/CropSkeleton';
import { apiUrl } from '../utils/api';

const CropPrimarySections = lazy(() => import('../components/crop/CropPrimarySections'));
const CropSidebarSections = lazy(() => import('../components/crop/CropSidebarSections'));
const payloadCache = new Map();

export const CropDetail = () => {
  const { cropName } = useParams();
  const { language, t } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const levelsT = t.soilWorkflow?.levels || { low: 'Low', medium: 'Medium', high: 'High' };

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setError('');
        const cached = payloadCache.get(cropName);
        if (cached) {
          if (!cancelled) {
            setPayload(cached);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const response = await fetch(apiUrl(`/api/crop/${encodeURIComponent(cropName)}`));
        const json = await response.json();
        if (!response.ok || json?.success === false) {
          if (response.status === 404) throw new Error(t.cropDetailPage.notFound);
          throw new Error(json?.error || t.cropDetailPage.error);
        }
        payloadCache.set(cropName, json);
        if (!cancelled) setPayload(json);
      } catch (e) {
        if (!cancelled) setError(e?.message || t.cropDetailPage.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [cropName, t.cropDetailPage.error, t.cropDetailPage.notFound]);

  const slug = payload?.cropName ? String(payload.cropName).toLowerCase() : '';
  const insights = useMemo(() => getCropInsights(slug), [slug]);
  const crop = payload?.data;
  const imageSrc = useMemo(() => getCropImage(slug || cropName) || DEFAULT_CROP_IMAGE, [slug, cropName]);

  if (loading) {
    return <CropSkeleton />;
  }

  if (error || !crop) {
    return (
      <div className="px-4 md:px-8 pt-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm">{error || t.cropDetailPage.error}</div>
      </div>
    );
  }

  const L = lang;
  const cd = t.cropDetailPage;
  const f = cd.fields;
  const overview = insights ? pickLocalized(insights.overview, L) : null;
  const soil = insights ? pickLocalized(insights.soilNutrition, L) : null;
  const irrig = insights ? pickLocalized(insights.irrigation, L) : null;
  const dis = insights ? pickLocalized(insights.diseasePest, L) : null;
  const wx = insights ? pickLocalized(insights.weatherCompat, L) : null;
  const mkt = insights ? pickLocalized(insights.marketIntel, L) : null;
  const aiReco = insights ? pickLocalized(insights.aiRecommendation, L) : null;
  const timeline = insights ? pickLocalized(insights.timeline, L) : [];
  const organic = insights ? pickLocalized(insights.organicTips, L) : [];
  const yieldP = insights ? pickLocalized(insights.yieldPrediction, L) : null;
  const profit = insights ? pickLocalized(insights.profitEstimation, L) : null;

  const displayName = L === 'hi' ? crop.name_hi || crop.name : crop.name;
  const confidenceTarget = insights?.aiConfidence ?? 88;

  return (
    <div className="relative min-h-screen pb-24 md:pb-10 overflow-x-hidden bg-gradient-to-b from-slate-50 via-emerald-50/60 to-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_65%_at_50%_-20%,rgba(16,185,129,0.14),transparent_56%)]" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 space-y-8">
        <CropHero
          imageSrc={imageSrc}
          displayName={displayName}
          description={L === 'hi' ? crop.description_hi || crop.description : crop.description}
          slug={slug}
          confidenceLabel={cd.confidence}
          confidenceTarget={confidenceTarget}
          heroBadge={cd.heroBadge}
        />

        <CropStats lang={L} crop={crop} />

        {!insights ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 flex gap-2 items-start">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{cd.fallbackInsight}</span>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />}>
              <CropPrimarySections
                cd={cd}
                fields={f}
                lang={L}
                crop={crop}
                overview={overview}
                soil={soil}
                irrig={irrig}
                dis={dis}
                wx={wx}
                mkt={mkt}
              />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />}>
              <CropSidebarSections
                cd={cd}
                fields={f}
                aiReco={aiReco}
                risks={insights?.risks}
                levelsT={levelsT}
                timeline={timeline}
                organic={organic}
                yieldP={yieldP}
                profit={profit}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};
