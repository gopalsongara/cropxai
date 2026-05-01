const { getCurrentWeather, getForecastWeather } = require('../services/weather.service');

const getGeoParams = (query = {}) => {
  const lat = Number(query.lat);
  const lon = Number(query.lon);

  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
  };
};

const getCurrentWeatherData = async (req, res) => {
  try {
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';
    const { lat, lon } = getGeoParams(req.query);
    const weather = await getCurrentWeather({ lang, lat, lon });

    return res.status(200).json(weather);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[WEATHER] Failed', error.message);
    }
    return res.status(500).json({
      success: false,
      error: 'Weather fetch failed',
    });
  }
};

const getForecastWeatherData = async (req, res) => {
  try {
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';
    const { lat, lon } = getGeoParams(req.query);
    const forecast = await getForecastWeather({ lang, lat, lon });

    return res.status(200).json(forecast);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[WEATHER_FORECAST] Failed', error.message);
    }
    return res.status(500).json({
      success: false,
      error: 'Weather forecast failed',
    });
  }
};

module.exports = {
  getCurrentWeatherData,
  getForecastWeatherData,
};
