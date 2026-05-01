export const pestData = [
  {
    id: 1,
    disease: { en: 'Leaf Rust', hi: 'पत्ती जंग' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 89,
    crop: { en: 'Wheat', hi: 'गेहूं' },
    symptoms: {
      en: 'Brown rust spots appear on leaves.',
      hi: 'पत्तियों पर भूरे जंग जैसे धब्बे दिखाई देते हैं।',
    },
    treatment: {
      en: 'Use fungicide spray and remove infected leaves.',
      hi: 'फफूंदनाशक का छिड़काव करें और संक्रमित पत्तियों को हटाएं।',
    },
    prevention: {
      en: 'Avoid excessive moisture and overcrowding.',
      hi: 'अधिक नमी और अत्यधिक घनत्व से बचें।',
    },
    organic: {
      en: 'Use neem oil spray weekly.',
      hi: 'हर सप्ताह नीम तेल का छिड़काव करें।',
    },
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    disease: { en: 'Aphid Infestation', hi: 'एफिड का प्रकोप' },
    severity: { key: 'high', en: 'High', hi: 'उच्च' },
    confidence: 92,
    crop: { en: 'Mustard', hi: 'सरसों' },
    symptoms: {
      en: 'Small sap-sucking insects cluster on soft leaves.',
      hi: 'कोमल पत्तियों पर रस चूसने वाले छोटे कीट समूह में दिखते हैं।',
    },
    treatment: {
      en: 'Spray recommended insecticide in evening.',
      hi: 'शाम के समय अनुशंसित कीटनाशक का छिड़काव करें।',
    },
    prevention: {
      en: 'Inspect underside of leaves regularly.',
      hi: 'पत्तियों के नीचे नियमित निरीक्षण करें।',
    },
    organic: {
      en: 'Apply neem oil 5ml/liter.',
      hi: '5ml/लीटर नीम तेल का उपयोग करें।',
    },
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    disease: { en: 'Powdery Mildew', hi: 'पाउडरी मिल्ड्यू' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 87,
    crop: { en: 'Pea', hi: 'मटर' },
    symptoms: {
      en: 'White powder-like layer appears over leaves.',
      hi: 'पत्तियों पर सफेद पाउडर जैसी परत दिखाई देती है।',
    },
    treatment: {
      en: 'Use sulfur-based fungicide spray.',
      hi: 'सल्फर आधारित फफूंदनाशक स्प्रे का उपयोग करें।',
    },
    prevention: {
      en: 'Maintain spacing for airflow.',
      hi: 'हवा के प्रवाह के लिए उचित दूरी रखें।',
    },
    organic: {
      en: 'Use diluted baking soda + neem mix.',
      hi: 'बेकिंग सोडा और नीम का पतला मिश्रण उपयोग करें।',
    },
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    disease: { en: 'Stem Borer', hi: 'तना छेदक' },
    severity: { key: 'high', en: 'High', hi: 'उच्च' },
    confidence: 90,
    crop: { en: 'Rice', hi: 'धान' },
    symptoms: {
      en: 'Stem holes and dead-heart symptoms appear.',
      hi: 'तने में छेद और डेड-हार्ट के लक्षण दिखाई देते हैं।',
    },
    treatment: {
      en: 'Apply larvicide at tillering stage.',
      hi: 'टिलरिंग अवस्था में लार्विसाइड का उपयोग करें।',
    },
    prevention: {
      en: 'Avoid excess nitrogen and monitor regularly.',
      hi: 'अधिक नाइट्रोजन से बचें और नियमित निगरानी करें।',
    },
    organic: {
      en: 'Use pheromone traps.',
      hi: 'फेरोमोन ट्रैप का उपयोग करें।',
    },
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e17b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    disease: { en: 'Leaf Blight', hi: 'लीफ ब्लाइट' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 86,
    crop: { en: 'Rice', hi: 'धान' },
    symptoms: {
      en: 'Yellow-brown streaks spread from leaf tips.',
      hi: 'पत्ती के सिरे से पीले-भूरे धब्बे फैलते हैं।',
    },
    treatment: {
      en: 'Use protective bactericide spray.',
      hi: 'सुरक्षात्मक बैक्टीरिसाइड स्प्रे करें।',
    },
    prevention: {
      en: 'Use balanced fertilizer and clean water.',
      hi: 'संतुलित उर्वरक और स्वच्छ पानी का उपयोग करें।',
    },
    organic: {
      en: 'Use bio-control spray at early stage.',
      hi: 'प्रारंभिक अवस्था में बायो-कंट्रोल स्प्रे करें।',
    },
    image: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    disease: { en: 'Root Rot', hi: 'जड़ सड़न' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 84,
    crop: { en: 'Chilli', hi: 'मिर्च' },
    symptoms: {
      en: 'Roots decay and plant wilts despite moisture.',
      hi: 'नमी होने पर भी जड़ सड़ती है और पौधा मुरझाता है।',
    },
    treatment: {
      en: 'Improve drainage and use root-zone fungicide.',
      hi: 'जल निकासी सुधारें और जड़ क्षेत्र फफूंदनाशक दें।',
    },
    prevention: {
      en: 'Avoid waterlogging and over-irrigation.',
      hi: 'जलभराव और अधिक सिंचाई से बचें।',
    },
    organic: {
      en: 'Apply trichoderma with compost.',
      hi: 'कंपोस्ट के साथ ट्राइकोडर्मा दें।',
    },
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    disease: { en: 'Mosaic Virus', hi: 'मोज़ेक वायरस' },
    severity: { key: 'high', en: 'High', hi: 'उच्च' },
    confidence: 88,
    crop: { en: 'Tomato', hi: 'टमाटर' },
    symptoms: {
      en: 'Mosaic mottling and leaf distortion appears.',
      hi: 'पत्तियों में मोज़ेक धब्बे और विकृति दिखाई देती है।',
    },
    treatment: {
      en: 'Remove infected plants and control vectors.',
      hi: 'संक्रमित पौधे हटाएं और वाहक कीट नियंत्रित करें।',
    },
    prevention: {
      en: 'Disinfect tools and monitor pests.',
      hi: 'उपकरणों को साफ रखें और कीटों की निगरानी करें।',
    },
    organic: {
      en: 'Use sticky traps and neem spray.',
      hi: 'स्टिकी ट्रैप और नीम स्प्रे उपयोग करें।',
    },
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    disease: { en: 'Armyworm', hi: 'आर्मीवर्म' },
    severity: { key: 'high', en: 'High', hi: 'उच्च' },
    confidence: 91,
    crop: { en: 'Maize', hi: 'मक्का' },
    symptoms: {
      en: 'Leaves are scraped and eaten from center.',
      hi: 'पत्तियां खुरचकर बीच से खाई हुई दिखती हैं।',
    },
    treatment: {
      en: 'Immediate larvicide application required.',
      hi: 'तुरंत लार्विसाइड का उपयोग आवश्यक है।',
    },
    prevention: {
      en: 'Early scouting and trap monitoring.',
      hi: 'शुरुआती स्काउटिंग और ट्रैप मॉनिटरिंग करें।',
    },
    organic: {
      en: 'Use neem + BT spray.',
      hi: 'नीम + बीटी स्प्रे करें।',
    },
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 9,
    disease: { en: 'Healthy Crop', hi: 'स्वस्थ फसल' },
    severity: { key: 'low', en: 'Low', hi: 'कम' },
    confidence: 93,
    crop: { en: 'General', hi: 'सामान्य' },
    symptoms: {
      en: 'No major disease signs detected.',
      hi: 'कोई प्रमुख रोग के लक्षण नहीं मिले।',
    },
    treatment: {
      en: 'No immediate treatment needed.',
      hi: 'तुरंत उपचार की आवश्यकता नहीं है।',
    },
    prevention: {
      en: 'Continue regular crop care.',
      hi: 'नियमित फसल देखभाल जारी रखें।',
    },
    organic: {
      en: 'Optional preventive neem spray biweekly.',
      hi: 'वैकल्पिक नीम प्रिवेंटिव स्प्रे हर 2 सप्ताह में करें।',
    },
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 10,
    disease: { en: 'Bacterial Spot', hi: 'बैक्टीरियल स्पॉट' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 85,
    crop: { en: 'Tomato', hi: 'टमाटर' },
    symptoms: {
      en: 'Small dark lesions with yellow halo on leaves.',
      hi: 'पत्तियों पर पीले घेरे के साथ छोटे काले धब्बे दिखाई देते हैं।',
    },
    treatment: {
      en: 'Use copper-based bactericide sprays.',
      hi: 'कॉपर आधारित बैक्टीरिसाइड स्प्रे का उपयोग करें।',
    },
    prevention: {
      en: 'Avoid overhead irrigation and leaf wetness.',
      hi: 'ऊपरी सिंचाई और पत्ती गीलापन से बचें।',
    },
    organic: {
      en: 'Use bio-copper and improve ventilation.',
      hi: 'बायो-कॉपर और बेहतर वेंटिलेशन अपनाएं।',
    },
    image: 'https://images.unsplash.com/photo-1598511726799-8ad9f14f0f4f?auto=format&fit=crop&w=1200&q=80',
  },
];

