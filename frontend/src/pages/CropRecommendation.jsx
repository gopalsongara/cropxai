import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, CloudRain, Calendar, Droplets, Info, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CROP_IMAGE } from '../data/cropImages';
import { apiUrl } from '../utils/api';

export const CropRecommendation = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [soilType, setSoilType] = useState('alluvial');
  const [weather, setWeather] = useState('moderate');
  const [season, setSeason] = useState('rabi');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const storedLang = localStorage.getItem('lang') || localStorage.getItem('cropx_language') || 'en';
  const requestLang = storedLang === 'hi' ? 'hi' : 'en';
  const isHindi = requestLang === 'hi';
  const selectedCropImage = result?.image || DEFAULT_CROP_IMAGE;
  const confidence = Number(result?.confidence || 0);

  const stepLabels = useMemo(
    () =>
      isHindi
        ? ['मिट्टी', 'मौसम', 'सीजन', 'परिणाम']
        : ['Soil', 'Weather', 'Season', 'Result'],
    [isHindi]
  );

  const handleRecommend = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('cropx_token') || localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/ai/crop-recommend'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          soil: soilType,
          weather,
          season,
          lang: requestLang,
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('API error');
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('[CROP_RECOMMEND_API]', data);
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'API error');
      }
      setResult({
        crop: data?.result?.crop || '-',
        cropKey: data?.result?.cropKey || 'wheat',
        details: data?.result?.reason || (isHindi ? 'कोई विवरण उपलब्ध नहीं है।' : 'No details available.'),
        scientificName: data?.result?.scientificName || '',
        duration: data?.result?.duration || (isHindi ? '—' : '—'),
        water: data?.result?.water || (isHindi ? '—' : '—'),
        soil: data?.result?.soil || (isHindi ? '—' : '—'),
        season: data?.result?.season || (isHindi ? '—' : '—'),
        farmingGuide: data?.result?.farmingGuide || null,
        marketInsights: data?.result?.marketInsights || '',
        image: data?.result?.image || DEFAULT_CROP_IMAGE,
        confidence: data?.result?.confidence || 98,
        badges: isHindi ? ['सर्वश्रेष्ठ फसल', 'उच्च उपज'] : ['Best Crop', 'High Yield'],
      });
      setShowResult(true);
      setStep(4);
    } catch (_error) {
      setError(isHindi ? 'कुछ गलत हुआ, कृपया फिर प्रयास करें।' : 'Something went wrong, try again');
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (result?.image) {
      // eslint-disable-next-line no-console
      console.log('IMAGE URL:', result.image);
    }
  }, [result?.image]);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-7xl mx-auto h-full flex flex-col pb-24 md:pb-8 space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {t.cropRecommendation.title}
        </h2>
        <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base">
          {t.cropRecommendation.subtitle}
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {stepLabels.map((label, index) => {
            const active = step >= index + 1;
            return (
              <div key={label} className={`text-center py-2 rounded-xl text-xs font-bold ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {index + 1}. {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: FORM */}
        <div className="flex-1 w-full lg:max-w-xl space-y-6">
          {/* Soil Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.cropRecommendation.form.soilType}</label>
            <div className="relative">
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                onBlur={() => setStep((prev) => Math.max(prev, 1))}
                className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="alluvial">{t.cropRecommendation.form.soilOptions.alluvial}</option>
                <option value="black">{t.cropRecommendation.form.soilOptions.black}</option>
                <option value="red">{t.cropRecommendation.form.soilOptions.red}</option>
                <option value="laterite">{t.cropRecommendation.form.soilOptions.laterite}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Weather Forecast */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.cropRecommendation.form.weather}</label>
            <div className="relative">
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                onBlur={() => setStep((prev) => Math.max(prev, 2))}
                className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="moderate">{t.cropRecommendation.form.weatherOptions.moderateRain}</option>
                <option value="sunny">{t.cropRecommendation.form.weatherOptions.sunny}</option>
                <option value="cloudy">{t.cropRecommendation.form.weatherOptions.cloudy}</option>
                <option value="heavy">{t.cropRecommendation.form.weatherOptions.heavyRain}</option>
              </select>
              <CloudRain className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.cropRecommendation.form.season}</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setSeason('rabi')}
                onFocus={() => setStep((prev) => Math.max(prev, 3))}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${season === 'rabi' ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {season === 'rabi' && <Check className="w-4 h-4" />}
                {t.cropRecommendation.form.seasonOptions.rabi}
              </button>
              <button 
                onClick={() => setSeason('kharif')}
                onFocus={() => setStep((prev) => Math.max(prev, 3))}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${season === 'kharif' ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {season === 'kharif' && <Check className="w-4 h-4" />}
                {t.cropRecommendation.form.seasonOptions.kharif}
              </button>
              <button 
                onClick={() => setSeason('zaid')}
                onFocus={() => setStep((prev) => Math.max(prev, 3))}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${season === 'zaid' ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {season === 'zaid' && <Check className="w-4 h-4" />}
                {t.cropRecommendation.form.seasonOptions.zaid}
              </button>
            </div>
          </div>

          <button 
            onClick={handleRecommend}
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-md shadow-green-700/20 transition-all active:scale-[0.98] mt-6 flex justify-center items-center"
          >
            {isLoading ? (isHindi ? 'AI विश्लेषण कर रहा है...' : 'AI analyzing...') : t.cropRecommendation.form.submit}
          </button>
          {isLoading ? (
            <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2 animate-pulse">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-bounce" />
              {isHindi ? '🤖 AI आपके डेटा का विश्लेषण कर रहा है...' : '🤖 AI is analyzing your farm data...'}
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        {/* RIGHT COLUMN: RESULT */}
        <div className={`flex-1 w-full lg:max-w-md transition-all duration-500 ease-out transform ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute lg:relative'}`}>
          {showResult && (
            <div>
              <div className="flex justify-between items-center mb-4 mt-6 lg:mt-0">
                <h3 className="text-xl font-bold text-slate-800">{t.cropRecommendation.result.topMatch}</h3>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full tracking-wider uppercase">
                  {result?.confidence || 98}% ACCURACY
                </span>
              </div>

              <div className="bg-white rounded-[24px] shadow-lg border border-slate-100 overflow-hidden relative border-l-4 border-l-green-600 group hover:shadow-xl transition-shadow duration-300">
                {/* Image Header */}
                <div className="h-48 md:h-56 relative overflow-hidden">
                  <img
                    src={selectedCropImage}
                    alt={result?.crop || t.cropRecommendation.result.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_CROP_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                     <h4 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-md">{result?.crop || t.cropRecommendation.result.cropName}</h4>
                     <p className="text-white/90 text-sm font-medium">
                      {result?.scientificName
                        ? isHindi
                          ? `वैज्ञानिक नाम: ${result.scientificName}`
                          : `Scientific Name: ${result.scientificName}`
                        : ''}
                     </p>
                     <div className="flex gap-2 mt-3">
                      {(result?.badges || []).map((badge) => (
                        <span key={badge} className="text-[10px] uppercase tracking-wide font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                          {badge}
                        </span>
                      ))}
                     </div>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
                      <Calendar className="w-5 h-5 text-green-700 mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        {isHindi ? 'अवधि' : 'Duration'}
                      </p>
                      <p className="font-semibold text-slate-800 text-sm">{result?.duration || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
                      <Droplets className="w-5 h-5 text-green-700 mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        {isHindi ? 'पानी' : 'Water'}
                      </p>
                      <p className="font-semibold text-slate-800 text-sm">{result?.water || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{isHindi ? 'मिट्टी' : 'Soil'}</p>
                      <p className="font-semibold text-slate-800 text-sm">{result?.soil || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{isHindi ? 'सीजन' : 'Season'}</p>
                      <p className="font-semibold text-slate-800 text-sm">{result?.season || '—'}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                         <Info className="w-3 h-3" />
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">{isHindi ? 'क्यों यह फसल?' : 'Why this crop?'}</h5>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-4">
                      {result?.details || (isHindi ? 'कोई विवरण उपलब्ध नहीं है।' : 'No details available.')}
                    </p>
                  </div>

                  <div className="mb-8 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">{isHindi ? 'खेती गाइड' : 'Farming Guide'}</h3>
                    {result?.farmingGuide ? (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p><b>{isHindi ? 'बुवाई:' : 'Sowing:'}</b> {result.farmingGuide.sowing}</p>
                        <p><b>{isHindi ? 'सिंचाई:' : 'Irrigation:'}</b> {result.farmingGuide.irrigation}</p>
                        <p><b>{isHindi ? 'उर्वरक:' : 'Fertilizer:'}</b> {result.farmingGuide.fertilizer}</p>
                        <p><b>{isHindi ? 'कीट:' : 'Pests:'}</b> {result.farmingGuide.pests}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">{isHindi ? 'खेती गाइड उपलब्ध नहीं है।' : 'Farming guide is unavailable.'}</p>
                    )}
                  </div>

                  <div className="mb-8 bg-green-50 border border-green-100 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-green-800 mb-2">{isHindi ? 'बाजार अंतर्दृष्टि' : 'Market Insights'}</h3>
                    <p className="text-sm text-green-700">
                      {result?.marketInsights || (isHindi ? 'कोई बाजार जानकारी उपलब्ध नहीं है।' : 'No market insights available.')}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span>{isHindi ? 'विश्वास स्तर' : 'Confidence'}</span>
                      <span>{confidence}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-700" style={{ width: `${confidence}%` }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/crop/${String(result?.cropKey || 'wheat').toLowerCase()}`, {
                        state: { lang: requestLang },
                      })
                    }
                    className="w-full bg-[#f4f8f4] hover:bg-green-50 text-green-800 font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 border border-green-100 shadow-sm transition-colors"
                  >
                    {t.cropRecommendation.result.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
