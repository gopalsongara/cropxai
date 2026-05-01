/** Pure helpers for smart farming sidebar utilities (no React). */

export function deriveSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 3) return 'rabi';
  return 'zaid';
}

export function normalizeCropKey(input) {
  const s = String(input || '').toLowerCase();
  if (/rice|paddy|धान|चावल/.test(s)) return 'rice';
  if (/maize|corn|मक्का/.test(s)) return 'maize';
  if (/mustard|सरसों/.test(s)) return 'mustard';
  return 'wheat';
}

const SOIL_FACTOR = {
  alluvial: { n: 1, k: 1, labelKey: 'alluvial' },
  black: { n: 0.95, k: 1.05, labelKey: 'black' },
  red: { n: 1.05, k: 1.08, labelKey: 'red' },
  laterite: { n: 1.08, k: 1.1, labelKey: 'laterite' },
  sandy: { n: 1.12, k: 1.12, labelKey: 'sandy' },
  clay: { n: 0.94, k: 0.96, labelKey: 'clay' },
  default: { n: 1, k: 1, labelKey: 'default' },
};

function soilFactors(soilType) {
  const key = String(soilType || '').toLowerCase();
  if (key.includes('black')) return SOIL_FACTOR.black;
  if (key.includes('red')) return SOIL_FACTOR.red;
  if (key.includes('laterite')) return SOIL_FACTOR.laterite;
  if (key.includes('sand')) return SOIL_FACTOR.sandy;
  if (key.includes('clay') || key.includes('चिकनी')) return SOIL_FACTOR.clay;
  if (key.includes('alluvial') || key.includes('जलोढ़')) return SOIL_FACTOR.alluvial;
  return SOIL_FACTOR.default;
}

/** kg product per hectare (rounded) — illustrative extension-style presets */
const BASE_PER_HA = {
  wheat: { urea: 165, dap: 55, mop: 30 },
  rice: { urea: 190, dap: 50, mop: 35 },
  maize: { urea: 210, dap: 80, mop: 45 },
  mustard: { urea: 90, dap: 40, mop: 25 },
};

export function computeFertilizerPlan({ cropKey, landHa, soilType, lang }) {
  const crop = BASE_PER_HA[cropKey] ? cropKey : 'wheat';
  const ha = Math.min(500, Math.max(0.01, Number(landHa) || 1));
  const { n, k } = soilFactors(soilType);
  const base = BASE_PER_HA[crop];
  const ureaHa = Math.round(base.urea * n);
  const dapHa = Math.round(base.dap);
  const mopHa = Math.round(base.mop * k);
  const ureaTotal = Math.round(ureaHa * ha);
  const dapTotal = Math.round(dapHa * ha);
  const mopTotal = Math.round(mopHa * ha);
  const fymTonnes = Math.round((crop === 'rice' ? 8 : crop === 'maize' ? 7 : 6) * ha * 10) / 10;

  const schedules = {
    wheat: {
      en: 'Basal: full DAP + one-third urea at sowing. Top-dress remaining urea at crown-root (~21 DAS) and late tillering.',
      hi: 'बेसल: बुवाई पर पूरा DAP + एक तिहाई यूरिया। शेष यूरिया जड़ चरण (~21 दिन) और देर टिलरिंग पर।',
    },
    rice: {
      en: 'Basal: DAP + partial urea at transplant. Split remaining nitrogen at tillering and panicle initiation.',
      hi: 'बेसल: रोपाई पर DAP + आंशिक यूरिया। शेष नाइट्रोजन टिलरिंग और बाली निकलने पर विभाजित करें।',
    },
    maize: {
      en: 'Basal DAP + starter N; side-dress bulk nitrogen around knee-high and pre-tassel.',
      hi: 'बेसल DAP + प्रारंभिक N; घुटना ऊँचाई और टसल से पहले शेष नाइट्रोजन साइड-ड्रेस करें।',
    },
    mustard: {
      en: 'Basal DAP + sulfur-bearing fertilizer where soils are deficient; light N splits during rapid growth.',
      hi: 'बेसल DAP + सल्फर युक्त उर्वरक जहाँ कमी हो; तेज़ वृद्धि में हल्के N भाग।',
    },
  };

  const organic = {
    en: `Well-decomposed compost / FYM ~${fymTonnes} tonnes for your area works alongside chemicals — adjust after soil test.`,
    hi: `रासायनिक के साथ सड़ी खाद/FYM लगभग ${fymTonnes} टन उपयुक्त — मिट्टी परीक्षण के बाद संशोधित करें।`,
  };

  return {
    crop,
    ha,
    ureaKg: ureaTotal,
    dapKg: dapTotal,
    mopKg: mopTotal,
    ureaPerHa: ureaHa,
    dapPerHa: dapHa,
    mopPerHa: mopHa,
    schedule: schedules[crop][lang === 'hi' ? 'hi' : 'en'],
    organicNote: organic[lang === 'hi' ? 'hi' : 'en'],
    soilFactorKey: soilFactors(soilType).labelKey,
  };
}

export function rainLikelyFromDay(day) {
  const p = Number(day?.rainProbability ?? 0);
  const cond = String(day?.condition || '').toLowerCase();
  if (p >= 50) return true;
  return /rain|drizzle|shower|storm|thunder|बारिश|वर्षा/.test(cond);
}

export function computeIrrigationPlan({ lang, cropKey, season, humidity, temp, forecastDays }) {
  const next = Array.isArray(forecastDays) ? forecastDays.slice(0, 4) : [];
  const rainSoon = next.some(rainLikelyFromDay);
  const heavyRain = next.some((d) => Number(d?.rainProbability ?? 0) >= 75 || /heavy|बहुत|ज़ोरदार|severe/i.test(String(d?.condition || '')));

  let nextWaterEn = 'Prefer early morning irrigation within 24–48h unless rain arrives.';
  let nextWaterHi = 'बारिश न आए तो 24–48 घंटे में सुबह की सिंचाई बेहतर।';
  if (rainSoon) {
    nextWaterEn = 'Rain likely soon — delay heavy irrigation and verify field drainage.';
    nextWaterHi = 'जल्द बारिश की संभावना — भारी सिंचाई टालें और जल निकास जाँचें।';
  }
  if (heavyRain) {
    nextWaterEn = 'Heavy rainfall risk — minimize irrigation today and avoid pesticide sprays.';
    nextWaterHi = 'भारी बारिश का जोखिम — आज सिंचाई कम रखें और कीटनाशक छिड़काव टालें।';
  }

  const moistureHint =
    humidity >= 78
      ? lang === 'hi'
        ? 'आर्द्रता अधिक है — पत्ती गीली होने से रोग बढ़ सकते हैं; छिड़काव सावधानी से।'
        : 'High humidity favours foliar disease — keep sprays thoughtful and improve airflow where possible.'
      : lang === 'hi'
        ? 'आर्द्रता सामान्य स्तर के करीब — नमी गेज या मिट्टी महसूस करके पानी की मात्रा तय करें।'
        : 'Humidity near moderate — confirm soil feel or moisture probe before irrigating.';

  const cropAdvice =
    cropKey === 'rice'
      ? lang === 'hi'
        ? 'धान: वनस्पति चरण में उथला खड़ा पानी; बारिश भराव पर जल गहराई घटाएँ।'
        : 'Rice: maintain shallow flood in vegetative phase; reduce depth if field catches rain.'
      : cropKey === 'maize'
        ? lang === 'hi'
          ? 'मक्का: सिल्किंग में नमी न टूटे — बारिश के बाद खेत में जलभराव रोकें।'
          : 'Maize: avoid moisture gap at silking — ensure drainage after intense rain.'
        : lang === 'hi'
          ? 'गेहूं/अन्य: जड़ चरण और दाना भराव पर सिंचाई प्राथमिकता रखें।'
          : 'Wheat/other: prioritise irrigation around crown-root initiation and grain filling.';

  return {
    summaryEn:
      (heavyRain
        ? 'Heavy rainfall expected soon — reduce irrigation today.'
        : rainSoon
          ? 'Rain expected in the next couple of days — reduce irrigation today.'
          : 'No strong rain signal — irrigate based on soil moisture and crop stage.') +
      ` (${season} season)`,
    summaryHi:
      (heavyRain
        ? 'आने वाले समय में भारी बारिश की संभावना — आज सिंचाई कम रखें।'
        : rainSoon
          ? 'अगले कुछ दिनों में बारिश की संभावना है — आज सिंचाई कम रखें।'
          : 'बारिश का तेज़ संकेत नहीं — मिट्टी की नमी और फसल चरण से सिंचाई करें।') + ` (${season})`,
    nextWater: lang === 'hi' ? nextWaterHi : nextWaterEn,
    moistureHint,
    cropAdvice,
    rainSoon,
    heavyRain,
  };
}

export function computeFarmInsightScores({ humidity, temp, forecastDays, soilType, crops }) {
  const h = Number.isFinite(humidity) ? humidity : 55;
  const t = Number.isFinite(temp) ? temp : 30;
  const next = Array.isArray(forecastDays) ? forecastDays.slice(0, 3) : [];
  const rainAvg = next.length ? next.reduce((s, d) => s + Number(d?.rainProbability ?? 0), 0) / next.length : 15;

  let soilHealth = 72;
  const sf = soilFactors(soilType);
  if (sf.labelKey === 'black' || sf.labelKey === 'alluvial') soilHealth += 14;
  else if (sf.labelKey === 'red' || sf.labelKey === 'laterite') soilHealth += 6;
  else if (sf.labelKey === 'sandy') soilHealth -= 4;
  soilHealth = Math.round(Math.min(96, Math.max(38, soilHealth + (crops?.length ? 4 : 0))));

  const soilMoisture = Math.round(Math.min(95, Math.max(22, h * 0.72 + rainAvg * 0.35)));

  let cropHealth = Math.round(Math.min(96, Math.max(40, 78 - Math.max(0, t - 34) * 1.2 + (100 - h) * 0.08)));
  if (rainAvg > 70) cropHealth -= 4;
  cropHealth = Math.round(Math.min(96, Math.max(42, cropHealth)));

  let nutrientKey = 'medium';
  if (sf.labelKey === 'black') nutrientKey = 'high';
  else if (sf.labelKey === 'sandy') nutrientKey = 'low';

  let irrigationNeedKey = 'medium';
  if (rainAvg >= 60) irrigationNeedKey = 'low';
  else if (rainAvg <= 20 && t >= 32) irrigationNeedKey = 'high';

  const statusFromScore = (score) => {
    if (score >= 75) return 'good';
    if (score >= 55) return 'mid';
    return 'risk';
  };

  const humidityStatus = h >= 84 ? 'risk' : h <= 36 ? 'mid' : 'good';

  return {
    humidityPct: Math.round(h),
    humidityStatus,
    soilHealth,
    soilMoisture,
    cropHealth,
    rainProbabilityAvg: Math.round(rainAvg),
    nutrientKey,
    irrigationNeedKey,
    soilHealthStatus: statusFromScore(soilHealth),
    cropHealthStatus: statusFromScore(cropHealth),
    moistureStatus: statusFromScore(soilMoisture),
  };
}
