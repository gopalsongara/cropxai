import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, FlaskConical, Leaf, CloudRain, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../utils/api';
import {
  computeFarmInsightScores,
  computeFertilizerPlan,
  computeIrrigationPlan,
  deriveSeason,
  normalizeCropKey,
  rainLikelyFromDay,
} from '../../utils/smartFarmingEngine';
import { recipesForCrop } from '../../data/organicPesticideGuides';
import { FarmingGlassModal } from './FarmingGlassModal';

const stripAi = (text) =>
  String(text || '')
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();

function StatusBar({ title, value, statusKey, sf }) {
  const statusLbl = statusKey === 'good' ? sf.statusGood : statusKey === 'mid' ? sf.statusMid : sf.statusRisk;
  const color =
    statusKey === 'good' ? 'bg-emerald-500' : statusKey === 'mid' ? 'bg-amber-500' : 'bg-rose-500';
  const glow =
    statusKey === 'good' ? 'shadow-emerald-500/30' : statusKey === 'mid' ? 'shadow-amber-400/30' : 'shadow-rose-400/30';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{title}</span>
        <div className="text-right">
          <span className="tabular-nums text-sm font-bold text-slate-900">{value}%</span>
          <span className="block text-[10px] font-semibold uppercase text-slate-500">{statusLbl}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color} shadow-md ${glow}`}
          style={{ width: `${Math.min(100, Math.max(4, value))}%` }}
        />
      </div>
    </div>
  );
}

function SegmentedHealth({ score }) {
  const segs = score >= 85 ? 3 : score >= 65 ? 2 : score >= 45 ? 1 : 0;
  const active = 'bg-emerald-600';
  const idle = 'bg-slate-200';
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < segs ? active : idle}`} />
      ))}
    </div>
  );
}

export const SmartFarmingSidebar = () => {
  const { t, language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const { user } = useAuth();
  const sf = t.smartFarming;

  const primaryCrop = normalizeCropKey(Array.isArray(user?.crops) && user.crops.length ? user.crops[0] : 'wheat');
  const profileSoil = String(user?.soilType || '').trim();

  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [current, setCurrent] = useState({
    temperature: 28,
    humidity: 55,
    wind: 10,
    condition: '—',
    location: '—',
  });
  const [forecast, setForecast] = useState([]);
  const [wxErr, setWxErr] = useState('');
  const [modal, setModal] = useState(null);
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [fertCrop, setFertCrop] = useState(primaryCrop);
  const [landHa, setLandHa] = useState(1);
  const [fertSoil, setFertSoil] = useState(
    profileSoil.toLowerCase().includes('black')
      ? 'black'
      : profileSoil.toLowerCase().includes('red')
        ? 'red'
        : profileSoil.toLowerCase().includes('sand')
          ? 'sandy'
          : profileSoil.toLowerCase().includes('clay') || profileSoil.includes('चिकनी')
            ? 'clay'
            : 'alluvial'
  );
  const [fertResult, setFertResult] = useState(null);

  useEffect(() => {
    setFertCrop(primaryCrop);
  }, [primaryCrop]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setCoords({ lat: null, lon: null }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  const loadWx = useCallback(async () => {
    try {
      setWxErr('');
      const q = new URLSearchParams({ lang });
      if (Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) {
        q.set('lat', String(coords.lat));
        q.set('lon', String(coords.lon));
      }
      const [resC, resF] = await Promise.all([
        fetch(apiUrl(`/api/weather/current?${q}`)),
        fetch(apiUrl(`/api/weather/forecast?${q}`)),
      ]);
      const dataC = await resC.json().catch(() => ({}));
      const dataF = await resF.json().catch(() => ({}));
      if (resC.ok && dataC && Number.isFinite(dataC.temperature)) {
        setCurrent({
          temperature: Number.isFinite(dataC.temperature) ? dataC.temperature : 28,
          humidity: Number.isFinite(dataC.humidity) ? dataC.humidity : 55,
          wind: Number.isFinite(dataC.wind) ? dataC.wind : 10,
          condition: dataC.condition || '—',
          location: dataC.location || '—',
        });
      }
      if (resF.ok && Array.isArray(dataF.forecast)) {
        setForecast(dataF.forecast);
      } else {
        setForecast([]);
      }
    } catch {
      setWxErr(lang === 'hi' ? 'मौसम डेटा अधूरा' : 'Weather partial/offline');
      setForecast([]);
    }
  }, [coords.lat, coords.lon, lang]);

  useEffect(() => {
    loadWx();
    const id = setInterval(loadWx, 120000);
    return () => clearInterval(id);
  }, [loadWx]);

  const season = useMemo(() => deriveSeason(), []);

  const insights = useMemo(
    () =>
      computeFarmInsightScores({
        humidity: current.humidity,
        temp: current.temperature,
        forecastDays: forecast,
        soilType: profileSoil || fertSoil,
        crops: user?.crops,
      }),
    [current.humidity, current.temperature, forecast, profileSoil, fertSoil, user?.crops]
  );

  const irrigationPlan = useMemo(
    () =>
      computeIrrigationPlan({
        lang,
        cropKey: primaryCrop,
        season,
        humidity: current.humidity,
        temp: current.temperature,
        forecastDays: forecast,
      }),
    [lang, primaryCrop, season, current.humidity, current.temperature, forecast]
  );

  const forecastHeadline = forecast[0];
  const headlineRain = forecastHeadline ? Number(forecastHeadline.rainProbability ?? 0) : 0;
  const headlineText =
    forecastHeadline?.condition ||
    (lang === 'hi' ? 'पूर्वानुमान लोड हो रहा है' : 'Loading forecast');

  useEffect(() => {
    if (!modal) {
      setAiTip('');
      return undefined;
    }
    let cancelled = false;
    const ctx = (() => {
      switch (modal) {
        case 'irrigation':
          return {
            crop: primaryCrop,
            season,
            humidity: current.humidity,
            rainSoon: irrigationPlan.rainSoon,
            summary: lang === 'hi' ? irrigationPlan.summaryHi : irrigationPlan.summaryEn,
          };
        case 'fertilizer':
          return (
            fertResult || {
              crop: fertCrop,
              landHa,
              soil: fertSoil,
              stage: fertResult ? 'calculated' : 'inputs_only',
            }
          );
        case 'organic':
          return { crop: primaryCrop, recipes: recipesForCrop(primaryCrop).length };
        case 'weather':
          return {
            temp: current.temperature,
            condition: current.condition,
            nextDays: forecast.slice(0, 3).map((d) => ({ day: d.day, rain: d.rainProbability, c: d.condition })),
          };
        case 'insights':
          return { ...insights, soilNote: profileSoil };
        default:
          return {};
      }
    })();

    const run = async () => {
      setAiLoading(true);
      setAiTip('');
      try {
        const res = await fetch(apiUrl('/api/ai/farming-tip'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: modal, context: ctx, lang }),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.success && data.tip) setAiTip(stripAi(data.tip));
      } catch {
        if (!cancelled) setAiTip('');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    modal,
    lang,
    primaryCrop,
    season,
    current.humidity,
    current.temperature,
    current.condition,
    irrigationPlan.rainSoon,
    irrigationPlan.summaryEn,
    irrigationPlan.summaryHi,
    fertResult,
    fertCrop,
    landHa,
    fertSoil,
    forecast,
    insights,
    profileSoil,
  ]);

  const cropLabel = (key) =>
    ({
      wheat: lang === 'hi' ? 'गेहूं' : 'Wheat',
      rice: lang === 'hi' ? 'धान / चावल' : 'Rice',
      maize: lang === 'hi' ? 'मक्का' : 'Maize',
      mustard: lang === 'hi' ? 'सरसों' : 'Mustard',
    }[key] || key);

  const handleFertCalc = () => {
    setFertResult(
      computeFertilizerPlan({
        cropKey: fertCrop,
        landHa,
        soilType: fertSoil,
        lang,
      })
    );
  };

  const topicCard = (Icon, title, desc, key, accent) => (
    <button
      key={key}
      type="button"
      onClick={() => setModal(key)}
      className={`w-full text-left p-4 rounded-2xl border border-slate-100 bg-white/70 backdrop-blur-md hover:border-emerald-300 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] hover:-translate-y-0.5 transition-all duration-300 group`}
    >
      <Icon className={`w-5 h-5 mb-2 ${accent}`} />
      <h4 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-emerald-800">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </button>
  );

  const recipes = recipesForCrop(primaryCrop);

  return (
    <>
      <div className="hidden xl:flex flex-col w-[320px] bg-white border-l border-slate-100 h-full overflow-y-auto p-6 space-y-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">{t.aiChat.sidebar.suggestedTopics}</h3>
          <div className="space-y-3">
            {topicCard(Droplets, t.aiChat.sidebar.irrigation.title, t.aiChat.sidebar.irrigation.desc, 'irrigation', 'text-sky-600')}
            {topicCard(
              FlaskConical,
              t.aiChat.sidebar.fertilizer.title,
              t.aiChat.sidebar.fertilizer.desc,
              'fertilizer',
              'text-amber-600'
            )}
            {topicCard(Leaf, t.aiChat.sidebar.pesticides.title, t.aiChat.sidebar.pesticides.desc, 'organic', 'text-emerald-600')}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{t.aiChat.sidebar.farmInsights}</h3>
            <button type="button" onClick={() => setModal('insights')} className="text-[10px] font-bold text-emerald-700 hover:underline">
              {sf.openDetails}
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 backdrop-blur-md p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <StatusBar
              title={sf.humidity}
              value={insights.humidityPct}
              statusKey={
                insights.humidityStatus === 'good' ? 'good' : insights.humidityStatus === 'mid' ? 'mid' : 'risk'
              }
              sf={sf}
            />
            <div className="mt-4 pt-3 border-t border-emerald-100/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{sf.soilHealth}</span>
                <span className="text-xs font-bold text-emerald-800">{insights.soilHealth}%</span>
              </div>
              <SegmentedHealth score={insights.soilHealth} />
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{sf.cropHealth}</span>
                <span className={`text-xs font-bold ${insights.cropHealthStatus === 'risk' ? 'text-rose-700' : 'text-emerald-800'}`}>
                  {insights.cropHealth}%
                </span>
              </div>
              <StatusBar
                title={sf.cropHealth}
                value={insights.cropHealth}
                statusKey={insights.cropHealthStatus === 'good' ? 'good' : insights.cropHealthStatus === 'mid' ? 'mid' : 'risk'}
                sf={sf}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModal('weather')}
            className="w-full rounded-2xl overflow-hidden relative h-36 group text-left border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4">
              <span className="text-white/75 text-[10px] font-bold uppercase tracking-wider">{t.aiChat.sidebar.localForecast}</span>
              <span className="text-white font-bold text-sm flex items-center gap-2 mt-1">
                {headlineText}
                {headlineRain >= 45 ? <CloudRain className="w-5 h-5 text-sky-300 shrink-0" /> : <TrendingUp className="w-4 h-4 text-emerald-300 shrink-0" />}
              </span>
              <span className="text-white/85 text-[11px] mt-1">
                {sf.rainProb}: {headlineRain}% · {current.temperature}°C
              </span>
            </div>
          </button>
          {wxErr ? <p className="text-[10px] text-amber-700 mt-2">{wxErr}</p> : null}
        </div>
      </div>

      <FarmingGlassModal
        open={modal === 'irrigation'}
        onClose={() => setModal(null)}
        title={sf.irrigationTitle}
        subtitle={`${cropLabel(primaryCrop)} · ${season}`}
      >
        <p className="text-sm font-semibold text-slate-900">{sf.rainAlert}</p>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{lang === 'hi' ? irrigationPlan.summaryHi : irrigationPlan.summaryEn}</p>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-emerald-800">{sf.nextWatering}: </span>
            {irrigationPlan.nextWater}
          </p>
          <p>
            <span className="font-semibold text-emerald-800">{sf.moistureTip}: </span>
            {irrigationPlan.moistureHint}
          </p>
          <p>
            <span className="font-semibold text-emerald-800">{sf.cropWaterTip}: </span>
            {irrigationPlan.cropAdvice}
          </p>
        </div>
        <AiTipBlock sf={sf} tip={aiTip} loading={aiLoading} />
      </FarmingGlassModal>

      <FarmingGlassModal open={modal === 'fertilizer'} onClose={() => setModal(null)} title={sf.fertilizerTitle} subtitle={sf.profileCropHint}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
            {sf.crop}
            <select
              value={fertCrop}
              onChange={(e) => setFertCrop(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              {['wheat', 'rice', 'maize', 'mustard'].map((c) => (
                <option key={c} value={c}>
                  {cropLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
            {sf.landArea} ({sf.hectares})
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={landHa}
              onChange={(e) => setLandHa(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600 flex flex-col gap-1">
            {sf.soilType}
            <select
              value={fertSoil}
              onChange={(e) => setFertSoil(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="alluvial">{sf.soilAlluvial}</option>
              <option value="black">{sf.soilBlack}</option>
              <option value="red">{sf.soilRed}</option>
              <option value="laterite">{sf.soilLaterite}</option>
              <option value="sandy">{sf.soilSandy}</option>
              <option value="clay">{sf.soilClay}</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={handleFertCalc}
          className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 transition-colors"
        >
          {sf.calculate}
        </button>
        {fertResult ? (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase text-slate-400">{sf.totalForPlot}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 uppercase">{sf.urea}</p>
                <p className="text-lg font-bold text-slate-900">{fertResult.ureaKg} kg</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 uppercase">{sf.dap}</p>
                <p className="text-lg font-bold text-slate-900">{fertResult.dapKg} kg</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 uppercase">{sf.mop}</p>
                <p className="text-lg font-bold text-slate-900">{fertResult.mopKg} kg</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {sf.perHa}: {fertResult.ureaPerHa} / {fertResult.dapPerHa} / {fertResult.mopPerHa} kg
            </p>
            <div>
              <p className="text-xs font-bold text-emerald-800 mb-1">{sf.schedule}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{fertResult.schedule}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 mb-1">{sf.organicRec}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{fertResult.organicNote}</p>
            </div>
          </div>
        ) : null}
        <AiTipBlock sf={sf} tip={aiTip} loading={aiLoading} />
      </FarmingGlassModal>

      <FarmingGlassModal open={modal === 'organic'} onClose={() => setModal(null)} title={sf.organicTitle} subtitle={`${cropLabel(primaryCrop)}`}>
        <p className="text-xs text-slate-600 mb-4">{sf.pickRecipe}</p>
        <div className="space-y-4">
          {recipes.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                {r.title[lang]}
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                <span className="font-semibold">{sf.prep}: </span>
                {r.ingredients[lang]}
              </p>
              <ul className="mt-2 text-xs text-slate-700 list-disc pl-4 space-y-1">
                {r.steps[lang].map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="text-xs mt-2">
                <span className="font-semibold text-emerald-800">{sf.timing}: </span>
                {r.timing[lang]}
              </p>
              <p className="text-xs mt-1 text-amber-900 bg-amber-50 rounded-lg px-2 py-1.5">
                <span className="font-semibold">{sf.precautions}: </span>
                {r.precautions[lang]}
              </p>
            </div>
          ))}
        </div>
        <AiTipBlock sf={sf} tip={aiTip} loading={aiLoading} />
      </FarmingGlassModal>

      <FarmingGlassModal open={modal === 'weather'} onClose={() => setModal(null)} title={sf.weatherTitle} subtitle={current.location}>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <p className="text-[10px] uppercase font-bold text-emerald-800">{lang === 'hi' ? 'अभी' : 'Now'}</p>
            <p className="text-3xl font-bold text-slate-900">{current.temperature}°C</p>
            <p className="text-sm text-slate-600 capitalize">{current.condition}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-[10px] uppercase font-bold text-slate-500">{sf.humidity}</p>
            <p className="text-xl font-bold text-slate-900">{current.humidity}%</p>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'हवा' : 'Wind'}: {current.wind} km/h
            </p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase text-slate-400 mb-2">{sf.forecast3d}</p>
        <div className="space-y-2">
          {forecast.slice(0, 3).map((d, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 bg-white">
              <span className="text-sm font-semibold text-slate-800">{d.day}</span>
              <span className="text-xs text-slate-600 capitalize">{d.condition}</span>
              <span className="text-xs font-bold text-sky-700">{d.rainProbability ?? 0}%</span>
              <span className="text-xs text-slate-500">{d.temperature}°C</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-950">
          <span className="font-semibold">{sf.farmAdvice}: </span>
          {forecast.slice(0, 2).some((d) => rainLikelyFromDay(d))
            ? lang === 'hi'
              ? 'आने वाले दिनों में बारिश संभावना है। कीटनाशक छिड़काव टालें और जल निकास जाँचें।'
              : 'Rain likely soon — delay pesticide sprays and verify drainage.'
            : lang === 'hi'
              ? 'मौसम अपेक्षाकृत स्थिर लगता है — मिट्टी नमी के अनुसार सिंचाई योजना बनाएँ।'
              : 'Weather looks relatively stable — plan irrigation using soil moisture checks.'}
        </div>
        <AiTipBlock sf={sf} tip={aiTip} loading={aiLoading} />
      </FarmingGlassModal>

      <FarmingGlassModal open={modal === 'insights'} onClose={() => setModal(null)} title={sf.insightsTitle} subtitle={current.location}>
        <div className="space-y-4">
          <StatusBar
            title={sf.soilMoisture}
            value={insights.soilMoisture}
            statusKey={insights.moistureStatus === 'good' ? 'good' : insights.moistureStatus === 'mid' ? 'mid' : 'risk'}
            sf={sf}
          />
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">{sf.nutrientLevel}</p>
            <p className="text-sm text-slate-800">
              {insights.nutrientKey === 'high' ? sf.nutHigh : insights.nutrientKey === 'low' ? sf.nutLow : sf.nutMed}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">{sf.irrigationNeed}</p>
            <p className="text-sm text-slate-800">
              {insights.irrigationNeedKey === 'high' ? sf.irrHigh : insights.irrigationNeedKey === 'low' ? sf.irrLow : sf.irrMed}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">{sf.rainfallOutlook}</p>
            <p className="text-sm text-slate-800">
              {lang === 'hi' ? 'औसत संभावना' : 'Average probability'} ~{insights.rainProbabilityAvg}% ({sf.forecast3d})
            </p>
          </div>
        </div>
        <AiTipBlock sf={sf} tip={aiTip} loading={aiLoading} />
      </FarmingGlassModal>
    </>
  );
};

function AiTipBlock({ sf, tip, loading }) {
  if (!loading && !tip) return null;
  return (
    <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/90 to-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase text-violet-700 mb-1">{sf.aiInsight}</p>
      {loading ? <p className="text-sm text-slate-600 animate-pulse">{sf.loadingAi}</p> : <p className="text-sm text-slate-800 leading-relaxed">{tip}</p>}
    </div>
  );
}
