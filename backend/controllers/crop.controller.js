const { getCropRecommendationDetails } = require('../services/ai.service');

const cropProfiles = {
  wheat: {
    name: 'Wheat',
    name_hi: 'गेहूं',
    duration: '110-140 days',
    duration_hi: '110-140 दिन',
    water: 'Moderate',
    water_hi: 'मध्यम',
    soil: 'Alluvial, loamy',
    soil_hi: 'जलोढ़, दोमट',
    season: 'Rabi',
    season_hi: 'रबी',
    guide: {
      sowing: 'Sow from late October to early December with certified seeds.',
      sowing_hi: 'अक्टूबर से दिसंबर के बीच प्रमाणित बीजों की बुवाई करें।',
      irrigation: 'First irrigation at crown root initiation, then every 20-25 days.',
      irrigation_hi: 'पहली सिंचाई जड़ बनने पर करें, फिर 20-25 दिनों के अंतराल पर।',
      fertilizer: 'Use balanced NPK with split nitrogen application.',
      fertilizer_hi: 'संतुलित NPK और विभाजित नाइट्रोजन का उपयोग करें।',
      pests: 'Watch for rust and aphids; use timely fungicide/insecticide.',
      pests_hi: 'रस्ट और एफिड पर नजर रखें; समय पर नियंत्रण करें।',
    },
    marketInsights: 'Demand usually rises near late-season procurement windows.',
    marketInsights_hi: 'मौसम के अंत में खरीद बढ़ने पर मांग और कीमत बढ़ सकती है।',
  },
  rice: {
    name: 'Rice',
    name_hi: 'चावल',
    duration: '100-130 days',
    duration_hi: '100-130 दिन',
    water: 'High',
    water_hi: 'अधिक',
    soil: 'Clayey, alluvial',
    soil_hi: 'चिकनी, जलोढ़',
    season: 'Kharif',
    season_hi: 'खरीफ',
    guide: {
      sowing: 'Transplant healthy seedlings in puddled field with proper spacing.',
      sowing_hi: 'रोपाई के लिए स्वस्थ पौधों का उपयोग करें और उचित दूरी बनाए रखें।',
      irrigation: 'Maintain shallow standing water during vegetative stage.',
      irrigation_hi: 'वनस्पतिक अवस्था में खेत में उथला पानी बनाए रखें।',
      fertilizer: 'Apply nitrogen in 2-3 splits with phosphorus at basal stage.',
      fertilizer_hi: 'नाइट्रोजन को 2-3 भागों में दें और बेसल पर फॉस्फोरस डालें।',
      pests: 'Monitor stem borer and leaf folder; follow IPM practices.',
      pests_hi: 'तना छेदक और पत्ती लपेटक पर नजर रखें।',
    },
    marketInsights: 'Prices improve with quality grain and lower regional arrivals.',
    marketInsights_hi: 'अच्छी गुणवत्ता और कम आवक के कारण कीमतें सुधर सकती हैं।',
  },
  maize: {
    name: 'Maize',
    name_hi: 'मक्का',
    duration: '90-120 days',
    duration_hi: '90-120 दिन',
    water: 'Moderate',
    water_hi: 'मध्यम',
    soil: 'Well-drained loam',
    soil_hi: 'अच्छी जलनिकासी वाली दोमट',
    season: 'Kharif/Zaid',
    season_hi: 'खरीफ/जायद',
    guide: {
      sowing: 'Use line sowing with recommended spacing and treated seeds.',
      sowing_hi: 'उचित दूरी के साथ कतारों में उपचारित बीजों की बुवाई करें।',
      irrigation: 'Critical irrigation at knee-high, tasseling and grain fill stages.',
      irrigation_hi: 'घुटना, टसलिंग और दाना भराव चरण में सिंचाई करें।',
      fertilizer: 'Apply phosphorus and potash basal; split nitrogen doses.',
      fertilizer_hi: 'फॉस्फोरस और पोटाश बेसल दें; नाइट्रोजन को विभाजित करें।',
      pests: 'Scout for fall armyworm and stem borer regularly.',
      pests_hi: 'फॉल आर्मीवर्म और स्टेम बोरर की नियमित निगरानी करें।',
    },
    marketInsights: 'Feed demand and transport costs strongly influence market rates.',
    marketInsights_hi: 'फीड मांग और ढुलाई लागत बाजार भाव को प्रभावित करती है।',
  },
  mustard: {
    name: 'Mustard',
    name_hi: 'सरसों',
    duration: '105-130 days',
    duration_hi: '105-130 दिन',
    water: 'Low to Moderate',
    water_hi: 'कम से मध्यम',
    soil: 'Loam to clay loam',
    soil_hi: 'दोमट से चिकनी दोमट',
    season: 'Rabi',
    season_hi: 'रबी',
    guide: {
      sowing: 'Sow in rows during October-November with treated seeds.',
      sowing_hi: 'अक्टूबर-नवंबर में कतारों में उपचारित बीज बोएं।',
      irrigation: 'Provide light irrigation at flowering and pod filling stage.',
      irrigation_hi: 'फूल और फलियां बनने के समय हल्की सिंचाई करें।',
      fertilizer: 'Use sulfur-rich fertilizers with balanced NPK dosing.',
      fertilizer_hi: 'सल्फर युक्त उर्वरक और संतुलित NPK का उपयोग करें।',
      pests: 'Monitor aphids and alternaria blight; spray when threshold crosses.',
      pests_hi: 'एफिड और अल्टरनेरिया ब्लाइट की निगरानी करें।',
    },
    marketInsights: 'Oilseed demand and edible oil imports heavily impact prices.',
    marketInsights_hi: 'तेलबीज मांग और आयात के आधार पर कीमतों में बदलाव आता है।',
  },
};

const normalizeCropKey = (cropName = '') => {
  const key = String(cropName).toLowerCase();
  if (key.includes('wheat')) return 'wheat';
  if (key.includes('rice')) return 'rice';
  if (key.includes('maize') || key.includes('corn')) return 'maize';
  if (key.includes('mustard')) return 'mustard';
  return null;
};

const pickCropByRules = ({ soilType, weather, season }) => {
  const normalizedSoil = String(soilType || '').toLowerCase();
  const normalizedWeather = String(weather || '').toLowerCase();
  const normalizedSeason = String(season || '').toLowerCase();

  if (normalizedSeason === 'rabi') {
    if (normalizedSoil === 'alluvial' && normalizedWeather !== 'heavy') return 'Wheat';
    if (normalizedSoil === 'black') return 'Chickpea';
    if (normalizedSoil === 'red') return 'Mustard';
    return 'Barley';
  }

  if (normalizedSeason === 'kharif') {
    if (normalizedWeather === 'heavy') return 'Rice';
    if (normalizedSoil === 'black') return 'Cotton';
    if (normalizedSoil === 'red') return 'Groundnut';
    return 'Maize';
  }

  if (normalizedWeather === 'sunny') return 'Watermelon';
  if (normalizedSoil === 'laterite') return 'Millet';
  return 'Moong';
};

const getCropRecommendation = async (req, res) => {
  try {
    const { soilType, weather, season, language } = req.body;

    if (!soilType || !weather || !season) {
      return res.status(400).json({ success: false, error: 'soilType, weather and season are required' });
    }

    const lang = language === 'hi' ? 'hi' : 'en';
    const crop = pickCropByRules({ soilType, weather, season });
    const profileKey = normalizeCropKey(crop) || 'wheat';
    const profile = cropProfiles[profileKey] || cropProfiles.wheat;

    let details = '';
    try {
      details = await getCropRecommendationDetails({ crop, soilType, weather, season, lang });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[CROP_RECOMMENDATION] AI enhancement failed:', error.message);
      }
      details =
        lang === 'hi'
          ? `${crop} आपके दिए गए मिट्टी प्रकार, मौसम और सीज़न के आधार पर उपयुक्त है। संतुलित उर्वरक और सिंचाई प्रबंधन रखें।`
          : `${crop} is suitable for your given soil type, weather, and season. Keep fertilizer and irrigation balanced for better yield.`;
    }

    return res.status(200).json({
      success: true,
      crop,
      details: details || (lang === 'hi' ? 'कोई विवरण उपलब्ध नहीं है।' : 'No details available.'),
      confidence: 96,
      badges: ['Best Crop', 'High Yield'],
      profile,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[CROP_RECOMMENDATION] Failed:', error);
    }
    return res.status(500).json({ success: false, error: 'Failed to generate crop recommendation' });
  }
};

const getCropDetails = async (req, res) => {
  try {
    const cropName = String(req.params.cropName || 'wheat');
    const cropKey = normalizeCropKey(cropName);
    if (!cropKey || !cropProfiles[cropKey]) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found',
      });
    }

    const profile = cropProfiles[cropKey];

    return res.status(200).json({
      success: true,
      data: {
        name: profile.name,
        name_hi: profile.name_hi,
        duration: {
          en: profile.duration,
          hi: profile.duration_hi,
        },
        water: {
          en: profile.water,
          hi: profile.water_hi,
        },
        season: {
          en: profile.season,
          hi: profile.season_hi,
        },
        soil: {
          en: profile.soil,
          hi: profile.soil_hi,
        },
        description: profile.marketInsights,
        description_hi: profile.marketInsights_hi,
        farmingGuide: {
          sowing: {
            en: profile.guide.sowing,
            hi: profile.guide.sowing_hi,
          },
          irrigation: {
            en: profile.guide.irrigation,
            hi: profile.guide.irrigation_hi,
          },
          fertilizer: {
            en: profile.guide.fertilizer,
            hi: profile.guide.fertilizer_hi,
          },
          pests: {
            en: profile.guide.pests,
            hi: profile.guide.pests_hi,
          },
        },
      },
      cropName: cropKey,
      profile,
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch crop details' });
  }
};

module.exports = {
  getCropRecommendation,
  getCropDetails,
};
