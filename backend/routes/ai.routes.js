const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  sendMessageToAI,
  testGroqAI,
  getSmartInsights,
  getFarmingToolTip,
  getAICropRecommendation,
} = require('../controllers/ai.controller');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many chat requests. Please wait a moment.', code: 'CLIENT_RATE_LIMIT' },
});

router.get('/test-ai', testGroqAI);
router.post('/chat', chatLimiter, sendMessageToAI);
router.post('/smart-insights', getSmartInsights);
router.post('/farming-tip', chatLimiter, getFarmingToolTip);
router.post('/crop-recommend', getAICropRecommendation);

module.exports = router;
