const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPEN_WEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const getBaseParams = ({ lang = 'en', lat, lon }) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = process.env.OPENWEATHER_CITY || 'Delhi';

  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is missing in environment variables');
  }

  const params = new URLSearchParams();
  params.set('appid', apiKey);
  params.set('units', 'metric');
  params.set('lang', lang === 'hi' ? 'hi' : 'en');

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    params.set('lat', String(lat));
    params.set('lon', String(lon));
  } else {
    params.set('q', city);
  }

  return { params, city };
};

const getCurrentWeather = async ({ lang = 'en', lat, lon } = {}) => {
  const { params, city } = getBaseParams({ lang, lat, lon });
  const url = new URL(OPEN_WEATHER_URL);
  url.search = params.toString();

  const response = await fetch(url.toString());
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `OpenWeather request failed (${response.status})`);
  }

  return {
    location: data?.name || city,
    temperature: Math.round(data?.main?.temp ?? 0),
    humidity: data?.main?.humidity ?? 0,
    wind: Math.round(((data?.wind?.speed ?? 0) * 3.6) * 10) / 10,
    condition: data?.weather?.[0]?.description || (lang === 'hi' ? 'अज्ञात' : 'Unknown'),
  };
};

const formatDayLabel = (date, lang) =>
  date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });

const getForecastWeather = async ({ lang = 'en', lat, lon } = {}) => {
  const { params, city } = getBaseParams({ lang, lat, lon });
  const url = new URL(OPEN_WEATHER_FORECAST_URL);
  url.search = params.toString();

  const response = await fetch(url.toString());
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `OpenWeather forecast failed (${response.status})`);
  }

  const items = Array.isArray(data?.list) ? data.list : [];
  const dailyMap = new Map();
  const popByDay = new Map();

  items.forEach((item) => {
    const dt = new Date((item?.dt || 0) * 1000);
    if (Number.isNaN(dt.getTime())) return;
    const dayKey = dt.toISOString().slice(0, 10);
    const hour = dt.getHours();
    const score = Math.abs(hour - 12);
    const popPct = Math.round(Math.min(100, Math.max(0, (item?.pop ?? 0) * 100)));
    popByDay.set(dayKey, Math.max(popByDay.get(dayKey) || 0, popPct));

    const existing = dailyMap.get(dayKey);
    const normalized = {
      dt,
      temperature: Math.round(item?.main?.temp ?? 0),
      humidity: item?.main?.humidity ?? 0,
      wind: Math.round(((item?.wind?.speed ?? 0) * 3.6) * 10) / 10,
      condition: item?.weather?.[0]?.description || (lang === 'hi' ? 'अज्ञात' : 'Unknown'),
      score,
    };

    if (!existing || normalized.score < existing.score) {
      dailyMap.set(dayKey, normalized);
    }
  });

  const daily = [...dailyMap.values()]
    .sort((a, b) => a.dt - b.dt)
    .slice(0, 7)
    .map((entry) => {
      const dayKey = entry.dt.toISOString().slice(0, 10);
      return {
        day: formatDayLabel(entry.dt, lang),
        temperature: entry.temperature,
        humidity: entry.humidity,
        wind: entry.wind,
        condition: entry.condition,
        rainProbability: popByDay.get(dayKey) ?? 0,
      };
    });

  return {
    location: data?.city?.name || city,
    forecast: daily,
  };
};

module.exports = {
  getCurrentWeather,
  getForecastWeather,
};
