import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Droplets, 
  ArrowRight,
  FlaskConical,
  BrainCircuit,
  MessageSquare,
  ChevronRight,
  Bug,
  Sprout,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api';

export const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const displayName = user?.name || 'Farmer';
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [forecast, setForecast] = useState([]);
  const [forecastError, setForecastError] = useState('');
  const [insights, setInsights] = useState({
    cropRecommendation: language === 'hi' ? 'लोड हो रहा है...' : 'Loading...',
    irrigationAdvice: language === 'hi' ? 'लोड हो रहा है...' : 'Loading...',
    riskWarnings: language === 'hi' ? 'लोड हो रहा है...' : 'Loading...',
  });
  const [insightsError, setInsightsError] = useState('');

  const [weather, setWeather] = useState({
    temperature: 32,
    condition: t.dashboard.weather.condition,
    humidity: 45,
    wind: 12,
    location: t.dashboard.weather.location,
  });
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setCoords({ lat: null, lon: null });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  useEffect(() => {
    const fallbackCondition = language === 'hi' ? 'मौसम उपलब्ध नहीं' : 'Weather unavailable';
    const fallbackLocation = language === 'hi' ? 'स्थान उपलब्ध नहीं' : 'Location unavailable';

    const loadWeather = async () => {
      try {
        setWeatherError('');
        const query = new URLSearchParams({ lang: language === 'hi' ? 'hi' : 'en' });
        if (Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) {
          query.set('lat', String(coords.lat));
          query.set('lon', String(coords.lon));
        }

        const response = await fetch(apiUrl(`/api/weather/current?${query.toString()}`));

        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.error || 'Failed to fetch weather');
        }
        setWeather({
          temperature: Number.isFinite(data?.temperature) ? data.temperature : 32,
          condition: data?.condition || fallbackCondition,
          humidity: Number.isFinite(data?.humidity) ? data.humidity : 45,
          wind: Number.isFinite(data?.wind) ? data.wind : 12,
          location: data?.location || fallbackLocation,
        });
      } catch (_error) {
        setWeatherError(language === 'hi' ? 'मौसम डेटा अभी उपलब्ध नहीं है' : 'Weather data is unavailable');
        setWeather((prev) => ({
          ...prev,
          condition: fallbackCondition,
          location: fallbackLocation,
        }));
      }
    };

    loadWeather();
  }, [language, coords.lat, coords.lon, t.dashboard.weather.condition, t.dashboard.weather.location]);

  useEffect(() => {
    const loadForecast = async () => {
      try {
        setForecastError('');
        const query = new URLSearchParams({ lang: language === 'hi' ? 'hi' : 'en' });
        if (Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) {
          query.set('lat', String(coords.lat));
          query.set('lon', String(coords.lon));
        }

        const response = await fetch(apiUrl(`/api/weather/forecast?${query.toString()}`));
        const data = await response.json();
        if (!response.ok || data?.success === false) throw new Error(data?.error || 'Forecast failed');
        const points = Array.isArray(data?.forecast) ? data.forecast : [];
        setForecast(points);
      } catch (_error) {
        setForecastError(
          language === 'hi' ? 'पूर्वानुमान डेटा उपलब्ध नहीं है' : 'Forecast data is unavailable'
        );
        setForecast([]);
      }
    };

    loadForecast();
  }, [language, coords.lat, coords.lon]);

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    const season = month >= 6 && month <= 10 ? 'kharif' : month >= 11 || month <= 3 ? 'rabi' : 'zaid';
    const soilType = 'alluvial';

    const loadInsights = async () => {
      try {
        setInsightsError('');
        const response = await fetch(apiUrl('/api/ai/smart-insights'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weather,
            soilType,
            season,
            lang: language,
          }),
        });

        const data = await response.json();
        if (!response.ok || data?.success === false) throw new Error(data?.error || 'AI insights failed');
        setInsights({
          cropRecommendation: data?.cropRecommendation || 'N/A',
          irrigationAdvice: data?.irrigationAdvice || 'N/A',
          riskWarnings: data?.riskWarnings || 'N/A',
        });
      } catch (_error) {
        setInsightsError(
          language === 'hi' ? 'एआई इनसाइट्स अभी उपलब्ध नहीं हैं' : 'AI insights are unavailable'
        );
        setInsights({
          cropRecommendation:
            language === 'hi'
              ? 'मौसम के अनुसार लचीली फसलें चुनें।'
              : 'Prefer climate-resilient crops for current weather.',
          irrigationAdvice:
            language === 'hi'
              ? 'मिट्टी की नमी देखकर सिंचाई की मात्रा तय करें।'
              : 'Adjust irrigation volume based on soil moisture.',
          riskWarnings:
            language === 'hi'
              ? 'कीट और अचानक मौसम परिवर्तन की निगरानी करें।'
              : 'Monitor pest pressure and sudden weather changes.',
        });
      }
    };

    loadInsights();
  }, [weather, language]);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 max-w-6xl w-full space-y-6 md:space-y-8 mx-auto">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          {`${t.dashboard.hello} ${displayName} 👋`}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {t.dashboard.helloSubDesk}
        </p>
      </div>

      {/* Top Row: Weather & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Weather Card */}
        <div className="lg:col-span-7 bg-[#43a047] md:bg-gradient-to-r md:from-[#f0f4f8] md:to-[#e6eef5] rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between shadow-sm md:shadow-none text-white md:text-slate-800 min-h-[160px] md:min-h-[220px]">
          
          <div className="flex h-full flex-col justify-between z-10 md:w-1/2">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/90 md:text-slate-500 uppercase mb-2">
              <MapPin className="w-3.5 h-3.5 md:text-green-600 text-white" />
              {weather.location}
            </div>
            
            <div className="flex items-baseline gap-2 mb-4 md:mb-6">
              <span className="text-5xl md:text-[64px] font-bold tracking-tighter leading-none">{weather.temperature}°C</span>
              <span className="text-lg md:text-xl md:text-slate-500 font-medium capitalize">{weather.condition}</span>
            </div>

            {weatherError ? (
              <p className="text-xs md:text-sm text-white/90 md:text-slate-500 mb-3">{weatherError}</p>
            ) : null}
            
            {/* Unified Weather details grid */}
            <div className="grid grid-cols-3 gap-2 text-sm pr-4">
              <div>
                <p className="text-white/70 md:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{t.dashboard.weather.humidity}</p>
                <p className="font-semibold md:text-slate-700 text-sm md:text-base">{weather.humidity}%</p>
              </div>
              <div>
                <p className="text-white/70 md:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{t.dashboard.weather.wind}</p>
                <p className="font-semibold md:text-slate-700 text-sm md:text-base">{weather.wind} km/h</p>
              </div>
              <div>
                <p className="text-white/70 md:text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{t.dashboard.weather.precipitation}</p>
                <p className="font-semibold md:text-slate-700 text-sm md:text-base">
                  {forecast[0]?.rainProbability != null ? `${forecast[0].rainProbability}%` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Unified Sun Graphic */}
          <div className="absolute right-[-20px] md:right-0 top-0 bottom-0 w-32 md:w-1/2 pointer-events-none flex items-center justify-center">
             <div className="hidden md:block absolute right-0 top-0 w-full h-full bg-gradient-to-l from-white/40 to-transparent z-0"></div>
             <div className="relative scale-75 md:scale-100 z-10 opacity-30 md:opacity-100 mix-blend-overlay md:mix-blend-normal mr-4 md:mr-0">
               <div className="w-20 h-20 bg-yellow-400 rounded-full shadow-none md:shadow-[0_0_40px_rgba(250,204,21,0.5)] relative z-10"></div>
               {[0,45,90,135,180,225,270,315].map(deg => (
                 <div key={deg} className="absolute top-1/2 left-1/2 w-2 h-32 -mt-16 -ml-1" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="w-2 h-4 bg-yellow-400 rounded-sm absolute top-0 left-0"></div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Stats Cards container */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Soil Moisture */}
          <div className="bg-white rounded-[20px] p-4 md:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-all border border-slate-100">
            <div className="flex justify-between items-start mb-4 md:mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets className="w-5 h-5 fill-current" />
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {t.dashboard.stats.optimal}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t.dashboard.stats.soilMoisture}</p>
              <p className="text-3xl md:text-4xl font-bold text-slate-800">68%</p>
            </div>
          </div>

          {/* Crop Health */}
          <div className="bg-white rounded-[20px] p-4 md:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-all border border-slate-100">
            <div className="flex justify-between items-start mb-4 md:mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Sprout className="w-5 h-5 fill-current" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {t.dashboard.stats.good}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t.dashboard.stats.cropHealth}</p>
              <p className="text-3xl md:text-4xl font-bold text-slate-800">82%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-7 bg-white rounded-[20px] p-5 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {language === 'hi' ? '7-दिवसीय तापमान ट्रेंड' : '7-Day Temperature Trend'}
            </h3>
            <span className="text-xs text-slate-500">{weather.location}</span>
          </div>
          {forecastError ? <p className="text-sm text-red-600">{forecastError}</p> : null}
          {!forecast.length && !forecastError ? (
            <p className="text-sm text-slate-500">
              {language === 'hi' ? 'पूर्वानुमान लोड हो रहा है...' : 'Loading forecast...'}
            </p>
          ) : null}
          {forecast.length ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="°C" />
                  <Tooltip formatter={(value) => [`${value}°C`, language === 'hi' ? 'तापमान' : 'Temperature']} />
                  <Line type="monotone" dataKey="temperature" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-5 bg-white rounded-[20px] p-5 md:p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {language === 'hi' ? 'स्मार्ट एआई इनसाइट्स' : 'Smart AI Insights'}
          </h3>
          {insightsError ? <p className="text-sm text-red-600 mb-3">{insightsError}</p> : null}
          <div className="space-y-3 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold">{language === 'hi' ? 'फसल:' : 'Crop:'}</span>{' '}
              {insights.cropRecommendation}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold">{language === 'hi' ? 'सिंचाई:' : 'Irrigation:'}</span>{' '}
              {insights.irrigationAdvice}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold">{language === 'hi' ? 'जोखिम:' : 'Risk:'}</span>{' '}
              {insights.riskWarnings}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 md:hidden">
         <h3 className="text-lg font-bold text-slate-800">{t.dashboard.quickActions}</h3>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Pest Detection */}
        <Link to="/pest-detection" className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-row md:flex-col items-center md:items-start text-left h-full gap-4 md:gap-0 cursor-pointer border border-slate-100 group">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center md:mb-4 shrink-0">
            <Bug className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 md:mb-2 text-base md:text-lg leading-tight">
              {t.dashboard.cards.pestDetection.title}
            </h3>
            <p className="text-sm text-slate-500 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
              {t.dashboard.cards.pestDetection.desc}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 md:hidden" />
          <button className="hidden md:flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700 mt-auto">
            {t.dashboard.cards.pestDetection.action} <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </Link>

        {/* Soil Testing */}
        <Link to="/soil-request" className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-row md:flex-col items-center md:items-start text-left h-full gap-4 md:gap-0 cursor-pointer border border-slate-100 group">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center md:mb-4 shrink-0">
            <FlaskConical className="w-6 h-6 fill-current" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 md:mb-2 text-base md:text-lg leading-tight">
              {t.dashboard.cards.soilTesting.title}
            </h3>
            <p className="text-sm text-slate-500 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
              {t.dashboard.cards.soilTesting.desc}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 md:hidden" />
          <button className="hidden md:flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700 mt-auto">
            {t.dashboard.cards.soilTesting.action} <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </Link>

        {/* Crop Guide */}
        <Link to="/crop-recommendation" className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-row md:flex-col items-center md:items-start text-left h-full gap-4 md:gap-0 cursor-pointer border border-slate-100 group">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center md:mb-4 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 md:mb-2 text-base md:text-lg leading-tight">
              {t.dashboard.cards.cropGuide.title}
            </h3>
            <p className="text-sm text-slate-500 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
              {t.dashboard.cards.cropGuide.desc}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 md:hidden" />
          <button className="hidden md:flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700 mt-auto">
            {t.dashboard.cards.cropGuide.action} <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </Link>

        {/* Market Insights */}
        <Link to="/market-insights" className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-row md:flex-col items-center md:items-start text-left h-full gap-4 md:gap-0 cursor-pointer border border-slate-100 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center md:mb-4 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 md:mb-2 text-base md:text-lg leading-tight">
              {t.dashboard.cards.marketInsights.title}
            </h3>
            <p className="text-sm text-slate-500 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
              {t.dashboard.cards.marketInsights.desc}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 md:hidden" />
          <button className="hidden md:flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700 mt-auto">
            {t.dashboard.cards.marketInsights.action} <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </Link>
      </div>

      {/* AI Assistant Card (Unified Banner) */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-[24px] p-6 md:p-8 relative overflow-hidden items-center justify-between border-2 border-white shadow-sm mt-8 flex">
        <div className="max-w-xl z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-full mb-4 md:mb-5 shadow-sm border border-white">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {t.dashboard.aiBanner.online}
          </div>
          <h2 className="text-2xl md:text-[28px] font-bold text-slate-800 mb-2 md:mb-3 tracking-tight">
            {t.dashboard.aiBanner.title}
          </h2>
          <p className="text-slate-600 text-sm mb-6 md:mb-8 leading-relaxed max-w-lg hidden md:block">
            {t.dashboard.aiBanner.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
            <Link to="/ai-chat" className="bg-[#43a047] hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
              <MessageSquare className="w-5 h-5" />
              {t.dashboard.aiBanner.startChatting}
            </Link>
          </div>
        </div>
        
        {/* Farmer Illustration Representation */}
        <div className="absolute right-[-40px] md:right-0 bottom-0 h-[120%] md:h-full w-[200px] md:w-[350px] pointer-events-none flex justify-end items-end pr-0 md:pr-8 opacity-40 md:opacity-100">
           <div className="relative w-48 h-48 md:w-64 md:h-64">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 md:w-48 h-24 md:h-32 bg-slate-400 rounded-t-full border-4 border-slate-500"></div>
             <div className="absolute bottom-20 md:bottom-28 left-1/2 -translate-x-1/2 w-16 md:w-20 h-20 md:h-24 bg-orange-200 rounded-full border-2 border-orange-300"></div>
             <div className="absolute bottom-32 md:bottom-44 left-1/2 -translate-x-1/2 w-24 md:w-32 h-10 md:h-12 bg-amber-700 rounded-t-full rounded-b-xl"></div>
           </div>
        </div>
      </div>
      
    </div>
  );
};
