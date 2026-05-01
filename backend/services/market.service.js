const { sendToGroq } = require('./ai.service');

const buildTrendSeries = ({ startPrice, dailyDrift }) =>
  Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const wave = Math.sin(day / 4) * 18;
    const price = Math.round(startPrice + dailyDrift * day + wave);
    return { label: `D${day}`, price };
  });

const marketDataByCrop = {
  wheat: {
    price: 2450,
    changePercent: 2.1,
    trend: 'up',
    chart: buildTrendSeries({ startPrice: 2220, dailyDrift: 6 }),
    mandiData: [
      { name: 'Delhi Mandi', price: 2410, changePercent: -0.2 },
      { name: 'Indore Mandi', price: 2485, changePercent: 1.4 },
      { name: 'Bhopal Mandi', price: 2440, changePercent: 0 },
    ],
    demand: {
      export: 85,
      domestic: 55,
      storage: 25,
      noteEn: 'Export demand is strong this week due to lower global inventory.',
      noteHi: 'वैश्विक स्टॉक कम होने से इस सप्ताह निर्यात मांग मजबूत है।',
    },
  },
  rice: {
    price: 3180,
    changePercent: 1.3,
    trend: 'up',
    chart: buildTrendSeries({ startPrice: 2960, dailyDrift: 4 }),
    mandiData: [
      { name: 'Lucknow Mandi', price: 3150, changePercent: 0.8 },
      { name: 'Karnal Mandi', price: 3205, changePercent: 1.6 },
      { name: 'Raipur Mandi', price: 3120, changePercent: -0.4 },
    ],
    demand: {
      export: 72,
      domestic: 68,
      storage: 34,
      noteEn: 'Domestic demand is stable while export buying has improved moderately.',
      noteHi: 'घरेलू मांग स्थिर है और निर्यात खरीद में मध्यम सुधार हुआ है।',
    },
  },
  maize: {
    price: 2275,
    changePercent: -1.1,
    trend: 'down',
    chart: buildTrendSeries({ startPrice: 2360, dailyDrift: -3 }),
    mandiData: [
      { name: 'Nashik Mandi', price: 2265, changePercent: -0.7 },
      { name: 'Kota Mandi', price: 2290, changePercent: 0.2 },
      { name: 'Nagpur Mandi', price: 2270, changePercent: -0.3 },
    ],
    demand: {
      export: 48,
      domestic: 61,
      storage: 43,
      noteEn: 'Feed industry demand is steady, but high arrivals are pressuring prices.',
      noteHi: 'फीड उद्योग की मांग स्थिर है, लेकिन अधिक आवक कीमतों पर दबाव बना रही है।',
    },
  },
};

const createFallbackSuggestion = ({ crop, lang, trend, changePercent }) => {
  if (lang === 'hi') {
    return {
      title: `${crop.toUpperCase()} बिक्री सुझाव`,
      description:
        trend === 'up'
          ? `बाजार रुझान सकारात्मक है। अगले 7-10 दिनों में चरणबद्ध बिक्री से बेहतर मूल्य मिल सकता है।`
          : `कीमतों में दबाव दिख रहा है। स्टॉक होल्डिंग लागत देखकर जल्दी बिक्री पर विचार करें।`,
      bestTime: 'अगले 7-10 दिन',
      expectedPrice: `अनुमानित: ₹${Math.round(marketDataByCrop[crop].price * (1 + changePercent / 100))}/क्विंटल`,
      confidence: 0.78,
    };
  }

  return {
    title: `${crop.toUpperCase()} Selling Suggestion`,
    description:
      trend === 'up'
        ? 'Market trend is positive. Staggered selling over the next 7-10 days can improve realization.'
        : 'Price pressure is visible. Consider early selling based on storage and carrying costs.',
    bestTime: 'Next 7-10 days',
    expectedPrice: `Estimated: Rs ${Math.round(marketDataByCrop[crop].price * (1 + changePercent / 100))}/quintal`,
    confidence: 0.78,
  };
};

const parseSuggestionReply = ({ crop, lang, rawReply, fallback }) => {
  const lines = String(rawReply || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const take = (prefix) =>
    lines.find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))?.slice(prefix.length).trim();

  return {
    title: take('Title:') || fallback.title,
    description: take('Advice:') || fallback.description,
    bestTime: take('BestTime:') || fallback.bestTime,
    expectedPrice: take('ExpectedPrice:') || fallback.expectedPrice,
    confidence: fallback.confidence,
    crop,
    language: lang,
  };
};

const getMarketInsightsByCrop = async ({ crop, lang = 'en', days = 30 }) => {
  const normalizedCrop = ['wheat', 'rice', 'maize'].includes(crop) ? crop : 'wheat';
  const selected = marketDataByCrop[normalizedCrop];
  const safeLang = lang === 'hi' ? 'hi' : 'en';
  const fallbackSuggestion = createFallbackSuggestion({
    crop: normalizedCrop,
    lang: safeLang,
    trend: selected.trend,
    changePercent: selected.changePercent,
  });

  let suggestion = fallbackSuggestion;
  try {
    const aiPrompt =
      safeLang === 'hi'
        ? `कृषि बाजार सलाहकार की तरह जवाब दें। फसल: ${normalizedCrop}
मौजूदा कीमत: ${selected.price}
रुझान: ${selected.trend}
परिवर्तन: ${selected.changePercent}%
निर्यात मांग: ${selected.demand.export}
घरेलू मांग: ${selected.demand.domestic}
भंडारण: ${selected.demand.storage}

सटीक 4 लाइनों में उत्तर दें:
Title: ...
Advice: ...
BestTime: ...
ExpectedPrice: ...`
        : `Act as an agriculture market advisor. Crop: ${normalizedCrop}
Current price: ${selected.price}
Trend: ${selected.trend}
Change: ${selected.changePercent}%
Export demand: ${selected.demand.export}
Domestic demand: ${selected.demand.domestic}
Storage pressure: ${selected.demand.storage}

Respond in exactly 4 lines:
Title: ...
Advice: ...
BestTime: ...
ExpectedPrice: ...`;

    const rawReply = await sendToGroq(aiPrompt, safeLang);
    suggestion = parseSuggestionReply({
      crop: normalizedCrop,
      lang: safeLang,
      rawReply,
      fallback: fallbackSuggestion,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[MARKET_AI] Suggestion fallback used:', error.message);
    }
  }

  const selectedDays = days === 7 ? 7 : 30;
  const filteredChart = selected.chart.slice(-selectedDays);

  return {
    crop: normalizedCrop,
    days: selectedDays,
    price: selected.price,
    trend: selected.trend,
    changePercent: selected.changePercent,
    chart: filteredChart,
    mandiData: selected.mandiData,
    demand: {
      export: selected.demand.export,
      domestic: selected.demand.domestic,
      storage: selected.demand.storage,
      note: safeLang === 'hi' ? selected.demand.noteHi : selected.demand.noteEn,
    },
    suggestion,
  };
};

/** Lightweight snapshot for cron / alerts (no Groq call). */
const getStaticMarketSnapshot = (crop) => {
  const normalizedCrop = ['wheat', 'rice', 'maize'].includes(String(crop || '').toLowerCase())
    ? String(crop).toLowerCase()
    : 'wheat';
  const selected = marketDataByCrop[normalizedCrop];
  return {
    crop: normalizedCrop,
    price: selected.price,
    changePercent: selected.changePercent,
    trend: selected.trend,
    noteEn: selected.demand.noteEn,
    noteHi: selected.demand.noteHi,
  };
};

module.exports = {
  getMarketInsightsByCrop,
  getStaticMarketSnapshot,
};
