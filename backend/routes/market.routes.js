const express = require('express');
const { getMarketInsights, getMarketPrices } = require('../controllers/market.controller');

const router = express.Router();

router.get('/', getMarketInsights);
router.get('/prices', getMarketPrices);

module.exports = router;
