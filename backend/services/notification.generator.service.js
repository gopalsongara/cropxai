const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { getStaticMarketSnapshot } = require('./market.service');
const { getCurrentWeather } = require('./weather.service');
const { sendToGroq } = require('./ai.service');

const dayBucket = () => Math.floor(Date.now() / 86400000);
const currentIsoWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const normalizePrimaryCrop = (crops) => {
  const list = Array.isArray(crops) ? crops : [];
  const first = String(list[0] || 'wheat').toLowerCase();
  if (first.includes('rice') || first.includes('paddy') || first.includes('धान')) return 'rice';
  if (first.includes('maize') || first.includes('corn') || first.includes('मक्का')) return 'maize';
  if (first.includes('mustard') || first.includes('सरसों')) return 'mustard';
  if (first.includes('wheat') || first.includes('गेहूं')) return 'wheat';
  return 'wheat';
};

async function createIfNew(userId, dedupeKey, payload) {
  if (!dedupeKey) return null;
  try {
    return await Notification.create({
      userId,
      dedupeKey,
      ...payload,
    });
  } catch (err) {
    if (err?.code === 11000) return null;
    throw err;
  }
}

async function buildWeatherAlert(user) {
  const uid = user._id;
  const bucket = dayBucket();
  const dedupeKey = `weather-${uid}-${bucket}`;
  const loc = (user.location || '').trim() || 'your area';
  const locHi = (user.location || '').trim() || 'आपके क्षेत्र';

  let temp = null;
  let condition = '';
  let humidity = null;
  try {
    const lang = user.language === 'hi' ? 'hi' : 'en';
    const wx = await getCurrentWeather({ lang });
    temp = wx.temperature;
    condition = wx.condition;
    humidity = wx.humidity;
  } catch (_e) {
    /* OPENWEATHER optional */
  }

  let titleEn = 'Weather advisory';
  let titleHi = 'मौसम सलाह';
  let messageEn = '';
  let messageHi = '';

  if (temp != null) {
    messageEn = `In ${loc}, it's about ${temp}°C with ${condition}. Humidity ${humidity}%. Adjust irrigation and field visits accordingly.`;
    messageHi = `${locHi} में लगभग ${temp}°C और ${condition} है। आर्द्रता ${humidity}%। सिंचाई और खेत भ्रमण समायोजित करें।`;
    if (temp >= 36) {
      titleEn = 'Heat stress alert';
      titleHi = 'गर्मी तनाव चेतावनी';
      messageEn += ' Reduce midday spraying; prioritize early morning irrigation.';
      messageHi += ' दोपहर में छिड़काव कम करें; सुबह की सिंचाई प्राथमिकता दें।';
    }
    if (humidity >= 85) {
      titleEn = 'High humidity — disease watch';
      titleHi = 'उच्च आर्द्रता — रोग निगरानी';
      messageEn += ' Foliar diseases may spread faster — widen scouting.';
      messageHi += ' पत्ती के रोग तेज़ फैल सकते हैं — निगरानी बढ़ाएँ।';
    }
  } else {
    messageEn = `Monitor rainfall and wind in ${loc}. Keep drainage channels clear and verify irrigation scheduling for your crops.`;
    messageHi = `${locHi} में बारिश और हवा देखें। जल निकास मार्ग साफ रखें और सिंचाई कार्यक्रम जाँचें।`;
  }

  return createIfNew(uid, dedupeKey, {
    type: 'weather',
    titleEn,
    titleHi,
    messageEn,
    messageHi,
    meta: { location: user.location || '', temp, humidity },
  });
}

const cropLabelHi = (crop) => {
  const c = String(crop || '').toLowerCase();
  if (c === 'rice') return 'धान';
  if (c === 'maize') return 'मक्का';
  if (c === 'mustard') return 'सरसों';
  return 'गेहूं';
};

async function buildMarketAlert(user) {
  const uid = user._id;
  const crop = normalizePrimaryCrop(user.crops);
  const bucket = dayBucket();
  const dedupeKey = `market-${uid}-${crop}-${bucket}`;
  const snap = getStaticMarketSnapshot(crop);
  const arrow = snap.trend === 'up' ? '↑' : snap.trend === 'down' ? '↓' : '→';

  const titleEn = `${crop.charAt(0).toUpperCase() + crop.slice(1)} mandi pulse`;
  const titleHi = `${cropLabelHi(crop)} मंडी अपडेट`;
  const messageEn = `Benchmark ~₹${snap.price}/q (${arrow} ${snap.changePercent}%). ${snap.noteEn}`;
  const messageHi = `लगभग ₹${snap.price}/क्विंटल (${arrow} ${snap.changePercent}%)। ${snap.noteHi}`;

  return createIfNew(uid, dedupeKey, {
    type: 'market',
    titleEn,
    titleHi,
    messageEn,
    messageHi,
    meta: { crop, price: snap.price, trend: snap.trend },
  });
}

async function buildPestAlert(user) {
  const uid = user._id;
  const crop = normalizePrimaryCrop(user.crops);
  const bucket = Math.floor(Date.now() / (86400000 * 2));
  const dedupeKey = `pest-${uid}-${crop}-${bucket}`;
  const soil = (user.soilType || '').trim();

  const pests =
    crop === 'rice'
      ? {
          en: 'Watch stem borer & leaf folder — sweep fields mid-morning.',
          hi: 'तना छेदक व पत्ती लपेटक — आधी सुबह खेत जाँच करें।',
        }
      : crop === 'maize'
        ? {
            en: 'Scout for fall armyworm near whorl — early BT-compatible IPM if thresholds cross.',
            hi: 'फॉल आर्मीवर्म के लिए व्हॉर्ल के पास जाँच — थ्रेशहोल्ड पर शुरुआती IPM।',
          }
        : crop === 'mustard'
          ? {
              en: 'Check flowering canopy for aphids & alternaria — widen rows if humidity persists.',
              hi: 'फूल पर एफिड और अल्टरनेरिया देखें — आर्द्रता पर पंक्तियों की दूरी बढ़ाएँ।',
            }
          : {
              en: 'Monitor rust & aphids on wheat canopy — rotate chemistry responsibly.',
              hi: 'गेहूं पर रस्ट और एफिड देखें — दवाओं का जिम्मेदारी से फेरबदल करें।',
            };

  const titleEn = `Pest vigilance — ${crop}`;
  const titleHi = `कीट निगरानी — ${cropLabelHi(crop)}`;
  let messageEn = pests.en;
  let messageHi = pests.hi;
  if (soil) {
    messageEn += ` Soil profile noted (${soil}) — adjust residue management if heavy texture.`;
    messageHi += ` मिट्टी: ${soil} — भारी बनावट पर अवशेष प्रबंधन समायोजित करें।`;
  }

  return createIfNew(uid, dedupeKey, {
    type: 'pest',
    titleEn,
    titleHi,
    messageEn,
    messageHi,
    meta: { crop, soilType: soil },
  });
}

async function buildCropSuggestion(user) {
  const uid = user._id;
  const weekNum = currentIsoWeek();
  const y = new Date().getFullYear();
  const dedupeKey = `crop-${uid}-${y}-W${weekNum}`;
  const crops = Array.isArray(user.crops) ? user.crops.filter(Boolean) : [];
  const loc = (user.location || '').trim() || 'your region';
  const soil = (user.soilType || '').trim();

  let titleEn = 'Crop rotation tip';
  let titleHi = 'फसल चक्र सुझाव';
  let messageEn = '';
  let messageHi = '';

  if (crops.length === 0) {
    messageEn = `No crops saved yet — add your crops in Profile for tailored alerts in ${loc}.`;
    messageHi = `अभी कोई फसल सहेजी नहीं — प्रोफ़ाइल में फसलें जोड़ें ताकि ${loc || 'क्षेत्र'} के लिए अलर्ट मिलें।`;
  } else {
    const primary = normalizePrimaryCrop(crops);
    messageEn = `Primary crop ${primary}: validate fertilizer splits with soil tests${soil ? ` (${soil})` : ''} and local advisory.`;
    messageHi = `मुख्य फसल ${primary}: मिट्टी परीक्षण${soil ? ` (${soil})` : ''} और स्थानीय सलाह से उर्वरक विभाजन पुष्टि करें।`;
  }

  return createIfNew(uid, dedupeKey, {
    type: 'crop',
    titleEn,
    titleHi,
    messageEn,
    messageHi,
    meta: { crops: crops.slice(0, 5), soilType: soil, location: loc },
  });
}

function parseSmartJson(raw) {
  const text = String(raw || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    if (
      obj &&
      typeof obj.titleEn === 'string' &&
      typeof obj.titleHi === 'string' &&
      typeof obj.messageEn === 'string' &&
      typeof obj.messageHi === 'string'
    ) {
      return obj;
    }
  } catch (_e) {
    /* ignore */
  }
  return null;
}

async function buildSmartAiAlert(user) {
  const uid = user._id;
  const weekNum = currentIsoWeek();
  const y = new Date().getFullYear();
  const dedupeKey = `smart-${uid}-${y}-W${weekNum}`;
  const crops = (Array.isArray(user.crops) ? user.crops : []).join(', ') || 'general farming';
  const loc = user.location || 'unspecified';
  const soil = user.soilType || 'unspecified';

  let titleEn = 'Smart farming check-in';
  let titleHi = 'स्मार्ट खेती चेक-इन';
  let messageEn = `Review irrigation timing for ${crops} near ${loc}; align nutrient plan with ${soil} soil testing if due this month.`;
  let messageHi = `${loc} में ${crops} के लिए सिंचाई समय की समीक्षा करें; यदि इस महीने मिट्टी परीक्षण है तो ${soil} मिट्टी के अनुसार पोषण योजना मिलाएँ।`;

  try {
    const prompt = `You output ONLY compact JSON (no markdown). Keys: titleEn,titleHi,messageEn,messageHi — max 12 words per title, max 40 words per message. Farmer context: location="${loc}", crops="${crops}", soil="${soil}". Give ONE actionable precision-ag alert for this week in India.`;
    const raw = await sendToGroq(prompt, 'en', [], { temperature: 0.35, max_tokens: 220 });
    const parsed = parseSmartJson(raw);
    if (parsed) {
      titleEn = parsed.titleEn.slice(0, 200);
      titleHi = parsed.titleHi.slice(0, 200);
      messageEn = parsed.messageEn.slice(0, 400);
      messageHi = parsed.messageHi.slice(0, 400);
    }
  } catch (_e) {
    /* Groq optional */
  }

  return createIfNew(uid, dedupeKey, {
    type: 'smart',
    titleEn,
    titleHi,
    messageEn,
    messageHi,
    meta: { crops, location: loc, soil },
  });
}

async function runNotificationBatchForUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  await buildWeatherAlert(user);
  await buildMarketAlert(user);
  await buildPestAlert(user);
  await buildCropSuggestion(user);
  await buildSmartAiAlert(user);
}

async function runNotificationBatchAllUsers() {
  const users = await User.find({})
    .select('_id crops location soilType language role farmSize')
    .lean();

  for (const u of users) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await runNotificationBatchForUser(u);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[NOTIFICATION_BATCH] user failed', u._id, err.message);
      }
    }
  }
}

module.exports = {
  runNotificationBatchForUser,
  runNotificationBatchAllUsers,
};
