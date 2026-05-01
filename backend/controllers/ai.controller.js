const { sendToGroq, getSmartFarmingInsights } = require('../services/ai.service');
const { cropImages, defaultCropImage } = require('../data/cropImages');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const resolveUserIdFromAuth = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch (_e) {
    return null;
  }
};

const sendMessageToAI = async (req, res) => {
  try {
    const { message, lang, history } = req.body;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[AI_CHAT] Incoming request body:', {
        lang,
        historyLen: Array.isArray(history) ? history.length : 0,
        message: typeof message === 'string' ? `[len=${message.length}]` : message,
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const requestLang = lang === 'hi' ? 'hi' : 'en';
    const conversationHistory = Array.isArray(history) ? history : [];
    const reply = await sendToGroq(message.trim(), requestLang, conversationHistory, {
      temperature: 0.55,
      max_tokens: 680,
    });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[AI_CHAT] Response generated', { lang: requestLang, replyLength: reply.length });
      // eslint-disable-next-line no-console
      console.log('[AI_CHAT] Response preview:', reply.slice(0, 120));
    }
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    const clientMessage = error.message || 'AI failed';

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[AI_CHAT] Failed', status, clientMessage, error.groqRaw || '');
    }

    if (status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Groq rate limit reached. Please wait a minute and try again.',
        code: 'RATE_LIMIT',
      });
    }

    if (status === 503) {
      return res.status(503).json({
        success: false,
        error: clientMessage,
        code: 'MISSING_API_KEY',
      });
    }

    return res.status(status === 500 ? 500 : status).json({
      success: false,
      error: clientMessage,
      ...(process.env.NODE_ENV === 'development' && error.groqRaw ? { detail: error.groqRaw } : {}),
    });
  }
};

const testGroqAI = async (req, res) => {
  try {
    const reply = await sendToGroq('Say hello in one short sentence.', 'en');
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    return res.status(status).json({
      success: false,
      error: error.message || 'Groq test failed',
      ...(process.env.NODE_ENV === 'development' && error.groqRaw ? { detail: error.groqRaw } : {}),
    });
  }
};

const getSmartInsights = async (req, res) => {
  try {
    const { weather, soilType, season, lang } = req.body;
    const requestLang = lang === 'hi' ? 'hi' : 'en';

    if (!weather || !soilType || !season) {
      return res.status(400).json({ success: false, error: 'weather, soilType and season are required' });
    }

    const insights = await getSmartFarmingInsights({
      weather,
      soilType,
      season,
      lang: requestLang,
    });

    return res.status(200).json(insights);
  } catch (error) {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[AI_SMART_INSIGHTS] Failed', status, error.message);
    }
    return res.status(status === 429 ? 429 : status === 503 ? 503 : 500).json({
      success: false,
      error: error.message || 'AI insights failed',
      ...(status === 429 ? { code: 'RATE_LIMIT' } : {}),
    });
  }
};

const getFarmingToolTip = async (req, res) => {
  try {
    const { tool, context, lang } = req.body || {};
    const L = lang === 'hi' ? 'hi' : 'en';
    if (!tool || typeof tool !== 'string') {
      return res.status(400).json({ success: false, error: 'tool is required' });
    }
    const ctx =
      typeof context === 'object' && context !== null
        ? JSON.stringify(context).slice(0, 900)
        : String(context || '').slice(0, 900);
    const prompt =
      L === 'hi'
        ? `आप CropAI किसान सहायक हैं। उपकरण: "${tool}". संदर्भ: ${ctx}\nकेवल हिंदी में 2–4 छोटे वाक्य दें — खेत की व्यावहारिक सलाह। कोई परिचय नहीं।`
        : `You are CropAI for farmers. Tool: "${tool}". Context: ${ctx}\nGive ONLY 2–4 short practical English sentences. No preamble.`;
    const tip = await sendToGroq(prompt, L, [], { temperature: 0.35, max_tokens: 280 });
    return res.status(200).json({ success: true, tip });
  } catch (error) {
    const status =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[FARMING_TIP]', error.message);
    }
    return res.status(status === 503 ? 503 : 500).json({
      success: false,
      error: error.message || 'Tip generation failed',
    });
  }
};

const getAICropRecommendation = async (req, res) => {
  try {
    const { soil, weather, season, lang } = req.body || {};
    const safeLang = lang === 'hi' ? 'hi' : 'en';
    const isHindi = safeLang === 'hi';
    const normalizedSoil = String(soil || '').toLowerCase();
    const normalizedWeather = String(weather || '').toLowerCase();
    const normalizedSeason = String(season || '').toLowerCase();

    if (!normalizedSoil || !normalizedWeather || !normalizedSeason) {
      return res.status(400).json({
        success: false,
        error: 'soil, weather and season are required',
      });
    }

    let result;
    let cropKey = 'wheat';

    if (normalizedWeather === 'heavy' || normalizedSeason === 'kharif') {
      cropKey = 'rice';
      result = {
        crop: isHindi ? 'चावल' : 'Rice',
        scientificName: 'Oryza sativa',
        reason: isHindi
          ? 'यह मौसम और सीजन धान के लिए बेहतर हैं।'
          : 'This weather and season are ideal for rice.',
        duration: isHindi ? '100-130 दिन' : '100-130 days',
        water: isHindi ? 'अधिक' : 'High',
        soil: isHindi ? 'चिकनी, जलोढ़' : 'Clayey, Alluvial',
        season: isHindi ? 'खरीफ' : 'Kharif',
        farmingGuide: {
          sowing: isHindi
            ? 'रोपाई के लिए स्वस्थ पौधों का उपयोग करें और उचित दूरी बनाए रखें'
            : 'Transplant healthy seedlings with proper spacing',
          irrigation: isHindi
            ? 'वनस्पतिक अवस्था में खेत में उथला पानी बनाए रखें'
            : 'Maintain shallow standing water during vegetative stage',
          fertilizer: isHindi
            ? 'नाइट्रोजन को 2-3 भागों में दें और बेसल पर फॉस्फोरस डालें'
            : 'Apply nitrogen in splits and phosphorus at basal stage',
          pests: isHindi
            ? 'तना छेदक और पत्ती लपेटक पर नजर रखें'
            : 'Monitor stem borer and leaf folder',
        },
        marketInsights: isHindi
          ? 'अच्छी गुणवत्ता और कम आवक के कारण कीमतें बढ़ सकती हैं'
          : 'Prices may improve due to quality grain and lower arrivals',
        confidence: 98,
      };
    } else if (normalizedSoil === 'alluvial' && normalizedSeason === 'rabi') {
      cropKey = 'wheat';
      result = {
        crop: isHindi ? 'गेहूं' : 'Wheat',
        scientificName: 'Triticum aestivum',
        reason: isHindi
          ? 'यह मिट्टी और सीजन गेहूं के लिए उपयुक्त हैं।'
          : 'This soil and season are ideal for wheat.',
        duration: isHindi ? '110-140 दिन' : '110-140 days',
        water: isHindi ? 'मध्यम' : 'Moderate',
        soil: isHindi ? 'जलोढ़, दोमट' : 'Alluvial, Loamy',
        season: isHindi ? 'रबी' : 'Rabi',
        farmingGuide: {
          sowing: isHindi
            ? 'अक्टूबर से दिसंबर के बीच प्रमाणित बीजों की बुवाई करें'
            : 'Sow certified seeds from October to December',
          irrigation: isHindi
            ? 'पहली सिंचाई जड़ बनने पर करें, फिर 20-25 दिनों के अंतराल पर'
            : 'Provide first irrigation at crown root initiation, then every 20-25 days',
          fertilizer: isHindi
            ? 'नाइट्रोजन को भागों में दें और संतुलित NPK उपयोग करें'
            : 'Apply nitrogen in split doses with balanced NPK',
          pests: isHindi
            ? 'रस्ट और एफिड पर नियमित निगरानी रखें'
            : 'Monitor rust and aphid incidence regularly',
        },
        marketInsights: isHindi
          ? 'कटाई के बाद मांग बढ़ने पर बेहतर दाम मिल सकते हैं'
          : 'Post-harvest demand windows can improve prices',
        confidence: 98,
      };
    } else {
      cropKey = 'mustard';
      result = {
        crop: isHindi ? 'सरसों' : 'Mustard',
        scientificName: 'Brassica juncea',
        reason: isHindi
          ? 'यह परिस्थिति सरसों के लिए उपयुक्त है, खासकर कम पानी वाले क्षेत्रों में।'
          : 'These conditions are suitable for mustard, especially in lower-water regions.',
        duration: isHindi ? '90-110 दिन' : '90-110 days',
        water: isHindi ? 'कम' : 'Low',
        soil: isHindi ? 'दोमट' : 'Loamy',
        season: isHindi ? 'रबी' : 'Rabi',
        farmingGuide: {
          sowing: isHindi
            ? 'अक्टूबर-नवंबर में लाइन से बुवाई करें'
            : 'Use line sowing during October-November',
          irrigation: isHindi
            ? 'फूल आने और दाना बनने पर हल्की सिंचाई करें'
            : 'Provide light irrigation at flowering and pod filling stage',
          fertilizer: isHindi
            ? 'सल्फर युक्त उर्वरक और संतुलित NPK का उपयोग करें'
            : 'Apply sulfur-rich fertilizers with balanced NPK',
          pests: isHindi
            ? 'एफिड और अल्टरनेरिया ब्लाइट पर नजर रखें'
            : 'Monitor aphids and alternaria blight',
        },
        marketInsights: isHindi
          ? 'तेल बीज की मांग बढ़ने पर कीमतें मजबूत रह सकती हैं'
          : 'Oilseed demand cycles can keep prices firm',
        confidence: 98,
      };
    }

    const userId = resolveUserIdFromAuth(req);
    if (userId) {
      const cropLabelEn = result?.crop || cropKey;
      try {
        await User.updateOne(
          { _id: userId },
          {
            $addToSet: {
              recommendedCrops: cropLabelEn,
              mainCrops: cropLabelEn,
              crops: cropLabelEn,
            },
          }
        );
      } catch (_persistErr) {
        // Non-blocking profile enrichment
      }
    }

    return res.status(200).json({
      success: true,
      result: {
        ...result,
        cropKey,
        image: cropImages[cropKey] || defaultCropImage,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate crop recommendation',
    });
  }
};

module.exports = {
  sendMessageToAI,
  testGroqAI,
  getSmartInsights,
  getFarmingToolTip,
  getAICropRecommendation,
};
