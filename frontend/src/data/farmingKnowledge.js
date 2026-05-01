export const cropKeywords = {
  wheat: ['गेहूं', 'gehu', 'wheat', 'gehun'],
  rice: ['धान', 'rice', 'chawal'],
  mustard: ['सरसों', 'mustard', 'sarson'],
  cotton: ['कपास', 'cotton', 'kapas'],
};

export const issueKeywords = {
  yellowing: ['पीली', 'पीला', 'yellow', 'pili', 'pila', 'yellowing'],
  pest: ['कीट', 'keede', 'pest', 'insect', 'keeda', 'keede', 'bugs'],
  watering: ['पानी', 'water', 'irrigation', 'sichai', 'सिंचाई', 'overwatering'],
  disease: ['दाग', 'spots', 'fungus', 'रोग', 'blight', 'infection', 'फफूंद', 'patti par daag'],
  drying: ['सूख', 'dry', 'suk', 'murjha', 'wilting', 'सूखी'],
};

export const greetings = {
  hi: ['नमस्ते किसान मित्र 🌱 मैं आपकी खेती में सहायता के लिए यहाँ हूँ।'],
  en: ['Hello Farmer 🌱 I am here to help with your farming problems.'],
};

export const cropNames = {
  wheat: { hi: 'गेहूं', en: 'wheat' },
  rice: { hi: 'धान', en: 'rice' },
  mustard: { hi: 'सरसों', en: 'mustard' },
  cotton: { hi: 'कपास', en: 'cotton' },
  default: { hi: 'फसल', en: 'crop' },
};

export const farmingKnowledge = {
  wheat: {
    yellowing: {
      hi: [
        'गेहूं की फसल में पीलापन नाइट्रोजन की कमी या अधिक सिंचाई का संकेत हो सकता है। संतुलित NPK और नियंत्रित सिंचाई करें।',
        'गेहूं में पीली पत्तियां दिखें तो पहले मिट्टी की नमी जांचें, फिर यूरिया की उचित मात्रा दें।',
        'गेहूं की पत्तियों का पीला होना जड़ तनाव से भी हो सकता है। जलभराव से बचें और हल्की गुड़ाई करें।',
      ],
      en: [
        'Yellowing in wheat may indicate nitrogen deficiency or over-irrigation. Use balanced NPK and control watering.',
        'If wheat leaves are turning yellow, check soil moisture first and then apply urea in proper dosage.',
        'Yellow leaves in wheat can also come from root stress. Avoid waterlogging and improve aeration.',
      ],
    },
    pest: {
      hi: [
        'गेहूं में कीट दिखें तो सुबह निरीक्षण करें और नीम आधारित जैविक कीटनाशक का छिड़काव करें।',
        'कीट संक्रमण बढ़ रहा हो तो प्रभावित हिस्से हटाएं और अनुशंसित कीटनाशक का समय पर उपयोग करें।',
      ],
      en: [
        'If pests are visible in wheat, inspect early morning and start neem-based bio-pesticide spray.',
        'When infestation increases, remove affected parts and apply recommended pesticide on time.',
      ],
    },
    watering: {
      hi: [
        'गेहूं में सिंचाई महत्वपूर्ण अवस्थाओं पर करें: क्राउन रूट, टिलरिंग और दाना भरने के समय।',
        'गेहूं के लिए हल्की और समयबद्ध सिंचाई करें, अधिक पानी से जड़ रोग बढ़ सकता है।',
      ],
      en: [
        'In wheat, irrigate at critical stages: crown root initiation, tillering, and grain filling.',
        'Use light and timely irrigation in wheat; excess water can increase root diseases.',
      ],
    },
    disease: {
      hi: [
        'गेहूं की पत्तियों पर दाग रोग का संकेत हो सकता है। फफूंदनाशक का छिड़काव और खेत स्वच्छता रखें।',
      ],
      en: [
        'Spots on wheat leaves may indicate disease. Apply fungicide and maintain field hygiene.',
      ],
    },
    drying: {
      hi: [
        'गेहूं सूख रहा हो तो नमी, जड़ स्वास्थ्य और कीट-रोग दबाव की तुरंत जांच करें।',
      ],
      en: [
        'If wheat is drying, quickly check moisture, root health, and pest/disease pressure.',
      ],
    },
  },
  default: {
    yellowing: {
      hi: [
        'पत्तियों का पीलापन पोषक तत्व की कमी या अधिक सिंचाई का संकेत हो सकता है।',
        'पीलापन दिखने पर मिट्टी नमी और खाद संतुलन दोनों जांचें।',
      ],
      en: [
        'Yellow leaves may indicate nutrient deficiency or overwatering.',
        'If yellowing appears, check both soil moisture and fertilizer balance.',
      ],
    },
    pest: {
      hi: [
        'यह कीट संक्रमण हो सकता है। नीम तेल या जैविक कीटनाशक का छिड़काव करें।',
        'कीट बढ़ रहे हों तो प्रभावित पत्तियां हटाएं और समय पर नियंत्रण करें।',
      ],
      en: [
        'This may be pest infestation. Apply neem-based or bio-pesticide spray.',
        'If pests are increasing, remove affected leaves and start timely control.',
      ],
    },
    watering: {
      hi: [
        'सुबह या शाम सिंचाई करें और अधिक जलभराव से बचें।',
        'सिंचाई से पहले मिट्टी की नमी जांचना बेहतर रहता है।',
      ],
      en: [
        'Irrigate in the morning or evening and avoid waterlogging.',
        'It is better to check soil moisture before irrigation.',
      ],
    },
    disease: {
      hi: [
        'पत्तियों पर दाग या फफूंद लक्षण दिखें तो जल्द रोग नियंत्रण शुरू करें।',
      ],
      en: [
        'If spots or fungal symptoms appear, start disease management quickly.',
      ],
    },
    drying: {
      hi: [
        'फसल सूख रही हो तो सिंचाई अंतराल और जड़ क्षेत्र की स्थिति जांचें।',
      ],
      en: [
        'If crop is drying, check irrigation interval and root-zone condition.',
      ],
    },
  },
};

export const prompts = {
  askIssue: {
    hi: 'ठीक है 🌾 आपकी {crop} की फसल में क्या समस्या दिखाई दे रही है?',
    en: 'Got it 🌾 What issue are you seeing in your {crop} crop?',
  },
  fallback: {
    hi: [
      'कृपया फसल या समस्या थोड़ी विस्तार से बताएं।',
      'कृपया लक्षण बताएं जैसे पीलापन, कीट, दाग, या सूखना।',
    ],
    en: [
      'Please describe your crop issue in more detail.',
      'Please share symptoms like yellowing, pests, spots, or drying.',
    ],
  },
  photo: {
    hi: [
      'हाँ, कृपया फसल की स्पष्ट तस्वीर अपलोड करें।',
      'जी, साफ और नज़दीक से फोटो भेजें ताकि सही सलाह मिल सके।',
    ],
    en: [
      'Yes, please upload a clear crop photo.',
      'Sure, share a close and clear image for better guidance.',
    ],
  },
};
