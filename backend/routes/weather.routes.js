const express = require('express');
const { getCurrentWeatherData, getForecastWeatherData } = require('../controllers/weather.controller');

const router = express.Router();

router.get('/current', getCurrentWeatherData);
router.get('/forecast', getForecastWeatherData);

module.exports = router;
