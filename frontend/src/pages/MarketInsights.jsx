import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Activity, CalendarDays, BarChart3 } from 'lucide-react';
import { apiUrl } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const MarketInsights = () => {
  const { language } = useLanguage();
  const [crop, setCrop] = useState('wheat');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const text = {
    title: language === 'hi' ? 'बाजार अंतर्दृष्टि' : 'Market Insights',
    subtitle:
      language === 'hi'
        ? '7-दिवसीय ट्रेंड के साथ लाइव मंडी-जैसा मूल्य डैशबोर्ड'
        : 'Live mandi-like pricing dashboard with 7-day trend',
    last7: language === 'hi' ? 'केवल पिछले 7 दिन' : 'Last 7 days only',
    crops: {
      wheat: language === 'hi' ? 'गेहूं' : 'Wheat',
      rice: language === 'hi' ? 'चावल' : 'Rice',
      corn: language === 'hi' ? 'मक्का' : 'Corn',
    },
    loadError:
      language === 'hi' ? 'अभी बाजार अंतर्दृष्टि लोड नहीं हो पाई।' : 'Unable to load market insights right now.',
    currentPrice: language === 'hi' ? 'मौजूदा कीमत' : 'Current Price',
    perQuintal: language === 'hi' ? 'प्रति क्विंटल' : 'Per quintal',
    growth: language === 'hi' ? '7-दिवसीय वृद्धि' : '7D Growth',
    marketMovement: language === 'hi' ? 'गतिशील बाजार रुझान' : 'Dynamic market movement',
    demand: language === 'hi' ? 'मांग' : 'Demand',
    recentTrend: language === 'hi' ? 'हालिया ट्रेंड आधारित' : 'Based on recent trend',
    forecast: language === 'hi' ? 'पूर्वानुमान' : 'Forecast',
    trendTitle: language === 'hi' ? '7-दिवसीय कीमत ट्रेंड' : '7-Day Price Trend',
    source: language === 'hi' ? 'स्रोत' : 'Source',
    price: language === 'hi' ? 'कीमत' : 'Price',
    smartTitle: language === 'hi' ? 'स्मार्ट बाजार सुझाव' : 'Smart Market Suggestion',
    bestWindow: language === 'hi' ? 'बेहतर समय' : 'Best Window',
    expectedRange: language === 'hi' ? 'अपेक्षित रेंज' : 'Expected Range',
  };

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(apiUrl(`/api/market/prices?crop=${crop}&lang=${language}`));
        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.error || 'Market fetch failed');
        }
        setData(data);
      } catch (_err) {
        setError(text.loadError);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [crop, language, text.loadError]);

  const growthPercent = useMemo(() => {
    if (!Array.isArray(data?.trend) || data.trend.length < 2) return 0;
    const first = Number(data.trend[0].price) || 0;
    const last = Number(data.trend[data.trend.length - 1].price) || 0;
    if (!first) return 0;
    return Number((((last - first) / first) * 100).toFixed(2));
  }, [data]);

  const skeletonCards = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 max-w-7xl mx-auto pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{text.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm text-xs font-semibold text-slate-600">
          <CalendarDays className="w-4 h-4" />
          {text.last7}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'wheat', label: text.crops.wheat },
          { key: 'rice', label: text.crops.rice },
          { key: 'corn', label: text.crops.corn },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setCrop(item.key)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              crop === item.key
                ? 'bg-green-700 text-white shadow-md shadow-green-700/20'
                : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {skeletonCards.map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm">{error}</div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{text.currentPrice}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">₹{Number(data.currentPrice || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{text.perQuintal}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{text.growth}</p>
              <p className={`text-3xl font-bold mt-2 ${growthPercent >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {growthPercent >= 0 ? '+' : ''}
                {growthPercent}%
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {text.marketMovement}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{text.demand}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{data.demand}</p>
              <p className="text-xs text-slate-500 mt-1">{text.recentTrend}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{text.forecast}</p>
              <p className="text-2xl font-bold text-slate-800 mt-2">₹{data.forecast}</p>
              <p className="text-xs text-slate-500 mt-1">{data.bestTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-700" />
                  {text.trendTitle}
                </h3>
                <span className="text-xs text-slate-500">{text.source}: {data.source}</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`₹${value}`, text.price]} />
                    <Line type="monotone" dataKey="price" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-green-700 rounded-2xl p-5 shadow-sm text-white">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">{text.smartTitle}</h3>
              <p className="text-sm text-green-100 mt-3 leading-relaxed">{data.recommendation}</p>
              <div className="mt-5 p-4 rounded-xl bg-black/15 border border-white/15">
                <p className="text-xs uppercase tracking-wide text-green-100">{text.bestWindow}</p>
                <p className="text-lg font-bold mt-1">{data.bestTime}</p>
                <p className="text-sm mt-2">{text.expectedRange}: ₹{data.forecast}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
