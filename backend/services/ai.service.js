const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 15000;
/** Supported Groq chat models (override via GROQ_MODEL): llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768 */
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('API KEY EXISTS:', Boolean(process.env.GROQ_API_KEY));
  // eslint-disable-next-line no-console
  console.log('GROQ MODEL:', GROQ_MODEL);
  // eslint-disable-next-line no-console
  console.log('GROQ VISION MODEL:', GROQ_VISION_MODEL);
}

const attachGroqStatus = (err, status, rawBody) => {
  const e = err instanceof Error ? err : new Error(String(err));
  e.statusCode = status;
  if (rawBody !== undefined) e.groqRaw = rawBody;
  return e;
};

/** Global CropAI assistant identity — always first in chat completions */
const CROP_AI_SYSTEM_PROMPT = `You are CropAI, an intelligent agriculture assistant for Indian farmers.

Rules:

* Reply in the same language as the user (Hindi, Hinglish, or English).
* Give practical farming advice.
* Keep responses short but useful.
* Focus on crops, pests, irrigation, fertilizer, weather, and soil.
* Never say you are an AI model.
* Be friendly and supportive.
* Ask follow-up questions when details are missing.
* Use farmer-friendly language.
* Avoid repeating the same reply.
* If user says only 'hello', greet naturally.
* If crop issue is unclear, ask for:
  crop name,
  symptoms,
  weather,
  and affected area.
* Use bullet points when giving solutions.`;

const stripAiMarkdown = (text) => {
  if (!text || typeof text !== 'string') return '';
  let s = text.replace(/```[\s\S]*?```/g, '');
  s = s.replace(/`([^`]+)`/g, '$1');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/^#{1,6}\s+/gm, '');
  s = s.replace(/^\s*[-*]\s+/gm, '• ');
  return s.replace(/\n{3,}/g, '\n\n').trim();
};

const normalizeGroqHistory = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim()
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 6000),
    }))
    .slice(-12);
};

/**
 * Chat completions with global system prompt first, then optional history, then latest user message.
 * @param {string} message - Latest user message
 * @param {string} lang - UI hint ('en' | 'hi'); model follows user language per system prompt
 * @param {Array<{role:string, content:string}>} conversationHistory - Prior turns (max ~6 exchanges server-side)
 * @param {object} options - temperature, max_tokens overrides for non-chat call sites
 */
const sendToGroq = async (message, lang = 'en', conversationHistory = [], options = {}) => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is missing in environment variables');
    err.statusCode = 503;
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const prior = normalizeGroqHistory(conversationHistory);
  const temperature =
    options.temperature !== undefined ? options.temperature : prior.length > 0 ? 0.55 : 0.45;
  const max_tokens = options.max_tokens !== undefined ? options.max_tokens : 650;

  const messages = [
    { role: 'system', content: CROP_AI_SYSTEM_PROMPT },
    ...prior,
    { role: 'user', content: message.trim() },
  ];

  const payload = {
    model: GROQ_MODEL,
    temperature,
    max_tokens,
    messages,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('GROQ REQUEST:', {
        url: GROQ_API_URL,
        model: GROQ_MODEL,
        lang,
        messageLength: message.length,
        historyTurns: prior.length,
      });
    }
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(
        'RAW GROQ RESPONSE:',
        JSON.stringify(data, null, 2).slice(0, 8000)
      );
    }

    if (!response.ok) {
      const apiMsg =
        data?.error?.message ||
        data?.message ||
        `Groq API request failed (${response.status})`;
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[GROQ] HTTP error', response.status, apiMsg);
      }
      throw attachGroqStatus(new Error(apiMsg), response.status, data);
    }

    const content = data?.choices?.[0]?.message?.content;
    const trimmed = typeof content === 'string' ? content.trim() : '';
    if (!trimmed) {
      throw attachGroqStatus(new Error('Empty reply from Groq'), 502, data);
    }
    return stripAiMarkdown(trimmed);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw attachGroqStatus(new Error('Groq API timeout'), 504);
    }
    if (error.statusCode) {
      throw error;
    }
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[GROQ] Network/unexpected error:', error.message);
    }
    throw attachGroqStatus(new Error(error.message || 'Groq API failed'), 500);
  } finally {
    clearTimeout(timeoutId);
  }
};

const buildCropRecommendationPrompt = ({ crop, soilType, weather, season, lang }) => {
  if (lang === 'hi') {
    return `आप एक कृषि विशेषज्ञ एआई सहायक हैं। किसान को सुझाई गई फसल के बारे में 3-4 छोटे, व्यावहारिक वाक्यों में कारण बताएं।
फसल: ${crop}
मिट्टी का प्रकार: ${soilType}
मौसम: ${weather}
मौसम/सीज़न: ${season}

उत्तर केवल हिंदी में दें।`;
  }

  return `You are an expert agriculture assistant.
Explain in 3-4 short practical sentences why this crop is suitable.
Crop: ${crop}
Soil type: ${soilType}
Weather: ${weather}
Season: ${season}

Respond only in English.`;
};

const getCropRecommendationDetails = async ({ crop, soilType, weather, season, lang = 'en' }) => {
  const prompt = buildCropRecommendationPrompt({
    crop,
    soilType,
    weather,
    season,
    lang: lang === 'hi' ? 'hi' : 'en',
  });

  return sendToGroq(prompt, lang, [], { temperature: 0.35, max_tokens: 520 });
};

const buildSmartInsightsPrompt = ({ weather, soilType, season, lang }) => {
  if (lang === 'hi') {
    return `आप एक स्मार्ट खेती एआई विशेषज्ञ हैं।
दिए गए डेटा के आधार पर संक्षिप्त सलाह दें:
- फसल सिफारिश (1 लाइन)
- सिंचाई सलाह (1 लाइन)
- जोखिम चेतावनी (1 लाइन)

डेटा:
तापमान: ${weather.temperature}°C
नमी: ${weather.humidity}%
हवा: ${weather.wind} km/h
स्थिति: ${weather.condition}
मिट्टी: ${soilType}
सीज़न: ${season}

उत्तर केवल हिंदी में दें और हर लाइन की शुरुआत क्रमशः "Crop:", "Irrigation:", "Risk:" से करें।`;
  }

  return `You are a smart farming AI expert.
Based on the data, provide concise advice:
- crop recommendation (1 line)
- irrigation advice (1 line)
- risk warning (1 line)

Data:
Temperature: ${weather.temperature}C
Humidity: ${weather.humidity}%
Wind: ${weather.wind} km/h
Condition: ${weather.condition}
Soil: ${soilType}
Season: ${season}

Respond only in English and start each line with exactly "Crop:", "Irrigation:", and "Risk:".`;
};

const getSmartFarmingInsights = async ({ weather, soilType, season, lang = 'en' }) => {
  const prompt = buildSmartInsightsPrompt({ weather, soilType, season, lang: lang === 'hi' ? 'hi' : 'en' });
  const rawReply = await sendToGroq(prompt, lang, [], { temperature: 0.35, max_tokens: 520 });

  const lines = String(rawReply || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const pick = (prefix, fallback) =>
    lines.find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))?.replace(prefix, '').trim() ||
    fallback;

  return {
    cropRecommendation: pick('Crop:', lang === 'hi' ? 'मौसम अनुसार दालें और अनाज प्राथमिकता दें।' : 'Prioritize resilient cereal and pulse crops.'),
    irrigationAdvice: pick('Irrigation:', lang === 'hi' ? 'मिट्टी की नमी देखकर मध्यम सिंचाई करें।' : 'Use moderate irrigation based on soil moisture.'),
    riskWarnings: pick('Risk:', lang === 'hi' ? 'अचानक मौसम बदलाव और कीट दबाव पर नजर रखें।' : 'Watch for sudden weather shifts and pest pressure.'),
    rawReply,
  };
};

const analyzePestFromImage = async ({ imageBase64, mimeType = 'image/jpeg', lang = 'en' }) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables');
  }

  const safeLang = lang === 'hi' ? 'hi' : 'en';
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const prompt =
    safeLang === 'hi'
      ? 'इस छवि में संभावित कीट/रोग पहचानें। केवल JSON दें: {"name":"...","severity":"low|medium|high","solution":"..."}'
      : 'Identify likely pest/disease in this crop image. Return only JSON: {"name":"...","severity":"low|medium|high","solution":"..."}';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('RAW GROQ VISION RESPONSE:', JSON.stringify(data, null, 2).slice(0, 6000));
  }
  if (!response.ok) {
    throw attachGroqStatus(
      new Error(data?.error?.message || `Groq vision request failed (${response.status})`),
      response.status,
      data
    );
  }

  const text = data?.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch {
    parsed = {
      name: safeLang === 'hi' ? 'अज्ञात समस्या' : 'Unknown issue',
      severity: 'medium',
      solution: text.slice(0, 500) || (safeLang === 'hi' ? 'विश्लेषण अस्पष्ट है।' : 'Analysis unclear.'),
    };
  }

  const normalizedSeverity = String(parsed?.severity || '').toLowerCase();
  const severity =
    normalizedSeverity === 'high' || normalizedSeverity === 'medium' || normalizedSeverity === 'low'
      ? normalizedSeverity
      : 'medium';

  return {
    name: parsed?.name || (safeLang === 'hi' ? 'अज्ञात समस्या' : 'Unknown issue'),
    severity,
    solution:
      parsed?.solution ||
      (safeLang === 'hi' ? 'स्थानीय कृषि विशेषज्ञ से सलाह लेकर उपयुक्त उपचार करें।' : 'Consult a local agronomist for suitable treatment.'),
  };
};

module.exports = {
  sendToGroq,
  getCropRecommendationDetails,
  getSmartFarmingInsights,
  analyzePestFromImage,
};
