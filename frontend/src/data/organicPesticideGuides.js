/** Bilingual organic treatment guides — crop-aware selection on UI */

export const ORGANIC_RECIPES = [
  {
    id: 'neem',
    crops: ['wheat', 'rice', 'maize', 'mustard'],
    title: { en: 'Neem oil spray', hi: 'नीम तेल का छिड़काव' },
    ingredients: {
      en: '5 ml neem oil + 2 ml mild liquid soap per litre water (emulsify before tank mixing).',
      hi: 'प्रति लीटर पानी में 5 ml नीम तेल + 2 ml हल्का तरल साबुन (टैंक में मिलाने से पहले पूरी तरह मिलाएँ)।',
    },
    steps: {
      en: ['Shake sprayer often.', 'Cover upper & lower leaf surfaces.', 'Spray in calm evening air.'],
      hi: ['स्प्रेयर को बार-बार हिलाते रहें।', 'पत्ती के ऊपर और नीचे दोनों तरफ छिड़कें।', 'शाम को शांत हवा में छिड़काव करें।'],
    },
    timing: {
      en: 'Early morning or after 4 PM — avoid midday heat.',
      hi: 'सुबह जल्दी या शाम 4 बजे के बाद — दोपहर की गर्मी में नहीं।',
    },
    precautions: {
      en: 'Do a small leaf test before full spray; bees — spray when pollinators less active.',
      hi: 'पूरे खेत से पहले छोटी जाँच करें; परागण कम होने पर छिड़कें।',
    },
  },
  {
    id: 'garlic',
    crops: ['wheat', 'rice', 'maize'],
    title: { en: 'Garlic–chilli deterrent', hi: 'लहसुन–मिर्च जैव स्प्रे' },
    ingredients: {
      en: 'Crush ~100 g garlic + 3–4 dry chillies, boil in 1 L water 15 min, strain, dilute to 8–10 L.',
      hi: 'लगभग 100 g लहसुन और 3–4 सुखी मिर्च कूटकर 1 L पानी में 15 मिनट उबालें, छानकर 8–10 L में मिलाएँ।',
    },
    steps: {
      en: ['Cool completely before spraying.', 'Use within 24 hours for best effect.', 'Reapply after rain.'],
      hi: ['ठंडा होने के बाद छिड़कें।', '24 घंटे के भीतर उपयोग करें।', 'बारिश के बाद दोबारा लगाएँ।'],
    },
    timing: { en: 'Evening application.', hi: 'शाम का समय।' },
    precautions: {
      en: 'Can irritate skin — gloves recommended.',
      hi: 'त्वचा में जलन हो सकती है — दस्ताने पहनें।',
    },
  },
  {
    id: 'cow',
    crops: ['rice', 'maize', 'wheat', 'mustard'],
    title: { en: 'Diluted fermented cow urine', hi: 'गोमूत्र जैविक घोल' },
    ingredients: {
      en: '1 part aged cow urine : 10 parts water (starter dilution); adjust per local practice.',
      hi: '1 भाग पुराना गोमूत्र : 10 भाग पानी (शुरुआती घोल); स्थानीय अनुभव से समायोजित करें।',
    },
    steps: {
      en: ['Filter before spray.', 'Target soil line & lower canopy weekly in humid weather.'],
      hi: ['छानकर छिड़कें।', 'नम मौसम में साप्ताहिक निचली छाया और मिट्टी रेखा पर।'],
    },
    timing: { en: 'Early morning.', hi: 'सुबह जल्दी।' },
    precautions: {
      en: 'Odour & neighbour etiquette — use prescribed dilution only.',
      hi: 'गंध और पड़ोस का ध्यान — केवल तय घोल उपयोग करें।',
    },
  },
  {
    id: 'bt_compat',
    crops: ['rice', 'maize'],
    title: { en: 'BT-compatible IPM window', hi: 'BT-अनुकूल IPM खिड़की' },
    ingredients: {
      en: 'Rotate neem / Bacillus products per label where stem borers or armyworm appear.',
      hi: 'जहाँ तना छेदक या आर्मीवर्म दिखे, नीम / Bacillus उत्पाद लेबल अनुसार फेरबदल करें।',
    },
    steps: {
      en: ['Scout field margins weekly.', 'Treat at egg mass / early larval thresholds only.'],
      hi: ['खेत के किनारे साप्ताहिक जाँच।', 'अंडे/प्रारंभिक लार्वा थ्रेशहोल्ड पर ही उपचार।'],
    },
    timing: { en: 'Calm wind, late afternoon.', hi: 'शांत हवा, देर दोपहर।' },
    precautions: {
      en: 'Protect beneficial insects — avoid bloom periods.',
      hi: 'फायदेमंद कीटों की सुरक्षा — फूल अवधि में टालें।',
    },
  },
];

export function recipesForCrop(cropKey) {
  return ORGANIC_RECIPES.filter((r) => r.crops.includes(cropKey));
}
