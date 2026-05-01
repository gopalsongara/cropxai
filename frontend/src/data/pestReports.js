export const pestReports = [
  {
    id: 1,
    disease: { en: 'Leaf Rust', hi: 'पत्ती जंग' },
    severity: { key: 'medium', en: 'Medium', hi: 'मध्यम' },
    confidence: 89,
    crop: { en: 'Wheat', hi: 'गेहूं' },
    symptoms: {
      en: ['Brown rust spots on leaves', 'Dry leaf edges', 'Slow crop growth'],
      hi: ['पत्तियों पर भूरे धब्बे', 'पत्तियों का सूखना', 'फसल की वृद्धि धीमी होना'],
    },
    causes: {
      en: ['High humidity', 'Dense crop canopy', 'Poor airflow'],
      hi: ['अधिक नमी', 'घनी फसल', 'कम वायु प्रवाह'],
    },
    treatment: {
      en: 'Use fungicide spray every 7 days.',
      hi: 'हर 7 दिन में फफूंदनाशक का छिड़काव करें।',
    },
    prevention: {
      en: 'Avoid excess moisture.',
      hi: 'अधिक नमी से बचें।',
    },
    organic: {
      en: 'Neem oil spray.',
      hi: 'नीम तेल का छिड़काव करें।',
    },
    chemical: {
      en: 'Propiconazole fungicide.',
      hi: 'प्रोपिकोनाजोल फफूंदनाशक।',
    },
    recommendation: {
      en: 'Start treatment early to prevent spread before flowering stage.',
      hi: 'फूल आने से पहले फैलाव रोकने के लिए उपचार जल्दी शुरू करें।',
    },
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    disease: { en: 'Aphid Infestation', hi: 'एफिड संक्रमण' },
    severity: { key: 'high', en: 'High', hi: 'गंभीर' },
    confidence: 92,
    crop: { en: 'Mustard', hi: 'सरसों' },
    symptoms: {
      en: ['Sticky leaves', 'Small insects visible', 'Yellow crop leaves'],
      hi: ['चिपचिपी पत्तियां', 'छोटे कीट दिखाई देना', 'पत्तियों का पीला होना'],
    },
    causes: {
      en: ['Sudden warm weather', 'Excess nitrogen', 'Weak pest monitoring'],
      hi: ['अचानक गर्म मौसम', 'अधिक नाइट्रोजन', 'कम निगरानी'],
    },
    treatment: {
      en: 'Use neem oil first, then spray insecticide if infestation persists.',
      hi: 'पहले नीम तेल का उपयोग करें, फिर जरूरत पर कीटनाशक का छिड़काव करें।',
    },
    prevention: {
      en: 'Scout lower leaf surface twice a week.',
      hi: 'सप्ताह में दो बार पत्तियों के नीचे निरीक्षण करें।',
    },
    organic: {
      en: 'Neem oil + soap solution in evening.',
      hi: 'शाम के समय नीम तेल + साबुन घोल का छिड़काव करें।',
    },
    chemical: {
      en: 'Imidacloprid (as per label recommendation).',
      hi: 'इमिडाक्लोप्रिड (लेबल अनुशंसा अनुसार)।',
    },
    recommendation: {
      en: 'Act quickly to avoid severe yield loss in flowering stage.',
      hi: 'फूल अवस्था में उपज हानि से बचने के लिए तुरंत नियंत्रण करें।',
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
      en: ['White powder on leaves', 'Weak stems', 'Reduced photosynthesis'],
      hi: ['पत्तियों पर सफेद पाउडर', 'कमजोर तने', 'प्रकाश संश्लेषण में कमी'],
    },
    causes: {
      en: ['Cool nights and humid mornings', 'Poor ventilation'],
      hi: ['ठंडी रातें और नम सुबह', 'कम वेंटिलेशन'],
    },
    treatment: {
      en: 'Apply sulfur fungicide spray on both leaf surfaces.',
      hi: 'पत्तियों के दोनों तरफ सल्फर फफूंदनाशक का छिड़काव करें।',
    },
    prevention: {
      en: 'Maintain proper plant spacing and avoid dense canopy.',
      hi: 'उचित पौध दूरी रखें और बहुत घनी फसल से बचें।',
    },
    organic: {
      en: 'Use diluted milk spray or neem-based fungicide.',
      hi: 'पतला दूध स्प्रे या नीम आधारित फफूंदनाशक उपयोग करें।',
    },
    chemical: {
      en: 'Wettable sulfur / hexaconazole as advised.',
      hi: 'सलाह अनुसार वेटेबल सल्फर / हेक्साकोनाजोल।',
    },
    recommendation: {
      en: 'Repeat spray at 7-day interval if symptoms continue.',
      hi: 'लक्षण बने रहने पर 7 दिन के अंतराल में स्प्रे दोहराएं।',
    },
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    disease: { en: 'Healthy Crop', hi: 'स्वस्थ फसल' },
    severity: { key: 'low', en: 'Low', hi: 'स्वस्थ' },
    confidence: 94,
    crop: { en: 'General', hi: 'सामान्य' },
    symptoms: {
      en: ['No visible disease', 'Healthy green leaves', 'Uniform crop stand'],
      hi: ['कोई रोग लक्षण नहीं', 'स्वस्थ हरी पत्तियां', 'समान फसल वृद्धि'],
    },
    causes: {
      en: ['Balanced nutrition', 'Good field hygiene', 'Timely irrigation'],
      hi: ['संतुलित पोषण', 'अच्छी खेत स्वच्छता', 'समय पर सिंचाई'],
    },
    treatment: {
      en: 'No treatment required currently.',
      hi: 'फिलहाल किसी उपचार की आवश्यकता नहीं।',
    },
    prevention: {
      en: 'Continue weekly monitoring and preventive care.',
      hi: 'साप्ताहिक निगरानी और निवारक देखभाल जारी रखें।',
    },
    organic: {
      en: 'Optional neem spray every 15 days.',
      hi: 'हर 15 दिन में वैकल्पिक नीम स्प्रे करें।',
    },
    chemical: {
      en: 'No chemical spray needed right now.',
      hi: 'इस समय रासायनिक स्प्रे की जरूरत नहीं।',
    },
    recommendation: {
      en: 'Maintain irrigation balance and keep pest scouting routine.',
      hi: 'सिंचाई संतुलन बनाए रखें और नियमित कीट निरीक्षण करें।',
    },
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
];

export const getPestReportById = (id) =>
  pestReports.find((report) => String(report.id) === String(id)) || pestReports[0];
