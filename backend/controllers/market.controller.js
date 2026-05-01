const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';

const cropMap = {
  wheat: 'Wheat',
  rice: 'Rice',
  corn: 'Maize',
  maize: 'Maize',
};

const demandLevels = ['High', 'Medium', 'Low'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (items) => items[randomInt(0, items.length - 1)];

const buildTrend = (basePrice) =>
  Array.from({ length: 7 }, (_, index) => ({
    day: `Day ${index + 1}`,
    price: Math.max(100, Math.round(basePrice + randomInt(-100, 100))),
  }));

const getDemandLabel = (demand, lang) => {
  if (lang !== 'hi') return demand;
  if (demand === 'High') return 'उच्च';
  if (demand === 'Medium') return 'मध्यम';
  return 'कम';
};

const getRecommendation = (demand, lang) => {
  if (lang === 'hi') {
    if (demand === 'High') return 'मांग मजबूत है, अभी चरणबद्ध SELL करें।';
    if (demand === 'Medium') return 'मांग स्थिर है, Partial Sell करना बेहतर रहेगा।';
    return 'मांग कम है, अभी HOLD करें और बेहतर समय का इंतजार करें।';
  }

  if (demand === 'High') return 'Demand is strong, consider SELL in staggered lots.';
  if (demand === 'Medium') return 'Demand is steady, Partial Sell is recommended.';
  return 'Demand is weak, consider HOLD for a better window.';
};

const buildResponse = ({ crop, basePrice, source, lang }) => {
  const currentPrice = Math.max(100, Math.round(basePrice));
  const forecastMin = Math.max(100, currentPrice + randomInt(100, 180));
  const forecastMax = forecastMin + randomInt(80, 140);
  const demand = pickRandom(demandLevels);
  const trend = buildTrend(currentPrice);

  return {
    success: true,
    crop,
    currentPrice,
    trend,
    demand: getDemandLabel(demand, lang),
    demandRaw: demand,
    bestTime: lang === 'hi' ? 'अगले 7-10 दिन' : 'Next 7-10 days',
    forecast: `${forecastMin} - ${forecastMax}`,
    recommendation: getRecommendation(demand, lang),
    source,
  };
};

const fetchMarketRecords = async ({ mappedCrop, state }) => {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    throw new Error('DATA_GOV_API_KEY is missing');
  }

  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '20',
  });
  params.set('filters[commodity]', mappedCrop);
  if (state) {
    params.set('filters[state]', state);
  }

  const url = `${DATA_GOV_BASE_URL}?${params.toString()}`;
  const response = await fetch(url, { method: 'GET' });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch data.gov.in records');
  }

  const records = Array.isArray(payload?.records) ? payload.records : [];
  return records;
};

const getMarketPrices = async (req, res) => {
  try {
    const crop = String(req.query.crop || 'wheat').toLowerCase();
    const mappedCrop = cropMap[crop] || cropMap.wheat;
    const state = req.query.state ? String(req.query.state).trim() : '';
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';

    try {
      const records = await fetchMarketRecords({ mappedCrop, state });
      const prices = records
        .map((record) => Number(record?.modal_price))
        .filter((price) => Number.isFinite(price) && price > 0);

      if (!prices.length) {
        throw new Error('No price data found in API response');
      }

      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return res.status(200).json(buildResponse({ crop, basePrice: avgPrice, source: 'data.gov.in', lang }));
    } catch (_apiError) {
      const fallbackBase = randomInt(1850, 3400);
      return res.status(200).json(buildResponse({ crop, basePrice: fallbackBase, source: 'fallback', lang }));
    }
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Market prices fetch failed',
    });
  }
};

module.exports = {
  getMarketPrices,
  getMarketInsights: getMarketPrices,
};
