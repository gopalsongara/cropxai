/**
 * Bilingual crop intelligence for Crop Detail page (en | hi only — no mixing).
 * Keys must match backend crop slug: wheat | rice | maize | mustard
 */

const L = (en, hi) => ({ en, hi });

export const CROP_INSIGHTS = {
  wheat: {
    overview: L(
      {
        summary:
          'Wheat is a staple cereal grown mainly in rabi under cool, moist winters. It prefers deep fertile soils and responds strongly to nitrogen timing.',
        whySuitable:
          'Ideal where winters are mild-to-cool with assured irrigation or residual soil moisture after monsoon.',
        climate: 'Temperate sub-tropical phase – cold establishment and dry warm ripening improve grain filling.',
        yieldRange: 'Typical irrigated fields: ~40–55 q/ha; strong management can exceed regional averages.',
      },
      {
        summary:
          'गेहूं रबी की मुख्य फसल है — ठंडे और नम सर्दियों में अच्छी उपज देती है। गहरी उपजाऊ मिट्टी और नाइट्रोजन का समय पर प्रबंधन ज़रूरी है।',
        whySuitable:
          'जहाँ सर्दी हल्की से ठंडी हो और सिंचाई या मानसून के बाद मिट्टी में नमी बनी रहे, वहाँ उपयुक्त।',
        climate: 'शीतोष्ण उपोष्ण जलवायु — ठंड में अच्छी स्थापना और गर्म सूखी परिपक्वता दाने को भरती है।',
        yieldRange: 'सिंचित खेत: लगभग 40–55 क्विंटल/हेक्टेयर; अच्छे प्रबंधन से औसत से अधिक संभव।',
      }
    ),
    soilNutrition: L(
      {
        soil: 'Well-drained loam to clay loam; deep alluvium performs best.',
        ph: '6.0–7.5 is optimal; extreme acidity limits phosphorus uptake.',
        nutrients: 'Heavy nitrogen demand at tillering and grain filling; sulphur often limiting on lighter soils.',
        npk: 'Split nitrogen (e.g. 3–4 splits); basal P & K; micronutrient zinc on deficient soils.',
      },
      {
        soil: 'अच्छी जल निकासी वाली दोमट से चिकनी दोमट; गहरी जलोढ़ सर्वोत्तम।',
        ph: 'pH 6.0–7.5 उपयुक्त; अत्यधिक अम्लीय मिट्टी में फॉस्फोरस कम लगता है।',
        nutrients: 'टिलरिंग और दाना भराव में नाइट्रोजन की अधिक मांग; हल्की मिट्टी में सल्फर कमी संभव।',
        npk: 'नाइट्रोजन विभाजित (3–4 बार); बेसल में P व K; जिंक की कमी पर सूक्ष्म उर्वरक।',
      }
    ),
    irrigation: L(
      {
        frequency: 'About 4–6 irrigations depending on rainfall and soil storage.',
        criticalStages: 'Crown root initiation, tillering, jointing, flowering and dough stages.',
        overwatering:
          'Avoid waterlogging – promotes root rot and lodging; maintain drainage in heavy soils.',
        drought: 'Prioritize irrigation at boot leaf and grain filling; mulch residues where feasible.',
      },
      {
        frequency: 'बारिश और मिट्टी की जल धारण क्षमता पर निर्भर — लगभग 4–6 सिंचाई।',
        criticalStages: 'जड़ विकास, टिलरिंग, जॉइंटिंग, फूल और आटा अवस्था।',
        overwatering: 'जलभराव से बचें — जड़ सड़न और गिरावट; भारी मिट्टी में जल निकास जरूरी।',
        drought: 'बूट लीफ और दाना भराव पर सिंचाई को प्राथमिकता; संभव हो तो मल्चिंग।',
      }
    ),
    diseasePest: L(
      {
        diseases: 'Rusts (brown/yellow/stripe), powdery mildew, fusarium head blight (humid ears).',
        pests: 'Aphids, pink stem borer on late sowings; termites in residues.',
        prevention: 'Resistant varieties, clean seed, crop rotation, avoid dense humid canopy.',
        organic: 'Neem-based sprays at threshold; trap crops and conservation biocontrol.',
        chemical: 'Use labelled fungicides/insecticides rotate MOAs; follow PHI strictly.',
      },
      {
        diseases: 'रस्ट (भूरा/पीला/धारीदार), पाउडरी मिल्ड्यू, नम कान पर फ्यूजेरियम।',
        pests: 'एफिड, देर से बुवाई पर गुलाबी तना छेदक; अवशेषों में दीमक।',
        prevention: 'प्रतिरोधी किस्में, स्वच्छ बीज, फसल चक्र, भीड़-भाड़ वाली नम छाया से बचाव।',
        organic: 'नीम आधारित स्प्रे, प्रथम चरण पर; जैव नियंत्रण।',
        chemical: 'अनुमोदित दवाएँ, MOA बदलते रहें; PHI का पालन करें।',
      }
    ),
    weatherCompat: L(
      {
        temp: '15–25 °C during vegetative growth; grain filling tolerates rising warmth if moisture adequate.',
        rainfall: '450–650 mm effective water preferred; irrigated systems compensate low rain.',
        humidity: 'Moderate humidity; prolonged leaf wetness raises foliar disease pressure.',
        seasonal: 'Best aligned with rabi in Indo-Gangetic and NW plains.',
      },
      {
        temp: 'वनस्पति वृद्धि में 15–25 °C; नमी से दाना भराव गर्मी सह सकता है।',
        rainfall: '450–650 mm प्रभावी जल उपयुक्त; कम बारिश में सिंचाई से पूर्ति।',
        humidity: 'मध्यम आर्द्रता; लंबे समय तक गीली पत्तियों से रोग बढ़ता है।',
        seasonal: 'भारत में गंगा मैदान और उत्तर-पश्चिम में रबी के अनुकूल।',
      }
    ),
    marketIntel: L(
      {
        demand: 'Stable institutional and household demand; MSP procurement supports prices in key states.',
        priceTrend: 'Often firm near harvest arrivals dip; quality premiums for bold grain.',
        bestSeason: 'Peak mandi movement post-April harvest windows in north India.',
        export: 'Durum and specialty grades offer export niches when quality certified.',
        profit: 'Good margins when yield >45 q/ha and storage avoids distress sale.',
      },
      {
        demand: 'स्थिर घरेलू व संस्थागत मांग; मुख्य राज्यों में MSP खरीद मूल्य सहारा देती है।',
        priceTrend: 'आवक के समय भाव हल्के; मोटे दाने की गुणवत्ता पर प्रीमियम।',
        bestSeason: 'उत्तर भारत में अप्रैल के बाद की मंडी गतिविधि मुख्य।',
        export: 'ड्यूरम व विशेष ग्रेड प्रमाणित गुणवत्ता पर निर्यात संभव।',
        profit: '45 क्विंटल/हे से अधिक उपज और भंडारण से बेहतर मुनाफा।',
      }
    ),
    aiRecommendation: L(
      'Based on typical cool-season establishment and responsive nitrogen management, wheat shows high agronomic success probability when irrigation is timed at crown root and grain filling.',
      'ठंडी मौसम की स्थापना और नाइट्रोजन प्रबंधन पर अच्छी प्रतिक्रिया के आधार पर, जड़ विकास और दाना भराव पर समय पर सिंचाई से गेहूं की सफलता की संभावना अधिक है।'
    ),
    risks: { disease: 'medium', water: 'medium', fertilizer: 'medium', weather: 'low' },
    timeline: L(
      [
        { title: 'Land prep & sowing', detail: 'Plough, compact seedbed, sow certified seed at optimum depth.' },
        { title: 'Irrigation — crown root', detail: 'First irrigation ~20–25 days after sowing unless moist.' },
        { title: 'Top dressing N', detail: 'Split nitrogen around tillering and stem elongation.' },
        { title: 'Grain filling', detail: 'Protect canopy from rust; ensure final irrigation timing.' },
        { title: 'Harvest', detail: 'Harvest at physiological maturity; timely threshing reduces loss.' },
      ],
      [
        { title: 'जुताई और बुवाई', detail: 'खेत तैयार करें, प्रमाणित बीज उचित गहराई पर बोएँ।' },
        { title: 'जड़ चरण की सिंचाई', detail: 'बुवाई के लगभग 20–25 दिन बाद पहली सिंचाई।' },
        { title: 'नाइट्रोजन टॉप ड्रेसिंग', detail: 'टिलरिंग और तना लंबाई पर N विभाजित करें।' },
        { title: 'दाना भराव', detail: 'रस्ट से बचाव; अंतिम सिंचाई का समय ठीक रखें।' },
        { title: 'कटाई', detail: 'शारीरिक परिपक्वता पर काटें; समय पर थ्रेशिंग से नुकसान कम।' },
      ]
    ),
    organicTips: L(
      [
        'Apply well-decomposed FYM/compost to improve soil carbon.',
        'Neem cake soil amendment helps suppress some soil pests.',
        'Biofertilizers (PSB/Zn solubilizers) on deficient soils after compatibility check.',
        'Crop residue retention with judicious burning avoidance improves soil health.',
      ],
      [
        'सड़ी खाद/FYM से कार्बन और संरचना सुधारें।',
        'नीम की खली मिट्टी में कुछ कीट दबाती है।',
        'जैव उर्वरक (PSB आदि) कमी वाली मिट्टी में संगतता जाँच के बाद।',
        'फसल अवशेष संरक्षित करें; अनावश्यक जलाना टालें।',
      ]
    ),
    yieldPrediction: L(
      {
        production: 'Model estimate 42–52 q/ha under recommended package.',
        quality: 'Bold grain and lower dockage with timely harvest and cleaning.',
        duration: 'Matches typical 110–140 day cultivar window.',
      },
      {
        production: 'संस्तुत पैकेज पर अनुमानित 42–52 क्विंटल/हे।',
        quality: 'समय पर कटाई और सफाई से मोटा दाना और कम अपशिष्ट।',
        duration: 'लगभग 110–140 दिन की किस्म के अनुरूप।',
      }
    ),
    profitEstimation: L(
      {
        income: 'Scenario: medium-high if MSP/procurement accessed or direct bulk sale.',
        investment: 'Moderate – seed, fertilizers, 4–6 irrigations, plant protection.',
        stability: 'Generally stable demand reduces extreme downside vs niche crops.',
      },
      {
        income: 'MSP/खरीद या थोक बिक्री पर मध्यम-उच्च परिदृश्य।',
        investment: 'मध्यम — बीज, उर्वरक, 4–6 सिंचाई, संरक्षण।',
        stability: 'स्थिर मांग से जोखिम सीमित।',
      }
    ),
    aiConfidence: 93,
  },

  rice: {
    overview: L(
      {
        summary:
          'Rice thrives in warm humid climates with assured water – either rainfall or irrigation – on puddled fields.',
        whySuitable:
          'Best where monsoon or canal water supports standing water during vegetative stages.',
        climate: 'Hot humid growing period with bright sunshine aids tillering and grain set.',
        yieldRange: 'High-input paddies often target 55–70 q/ha paddy; varies sharply by ecology.',
      },
      {
        summary:
          'चावल गर्म आर्द्र जलवायु में अच्छी उपज देता है — बारिश या सिंचाई से खेत में पर्याप्त जल चाहिए।',
        whySuitable:
          'जहाँ मानसून या नहर का पानी वनस्पति अवस्था में खड़े जल को संभाल सके।',
        climate: 'गर्म आर्द्र मौसम और धूप टिलरिंग और दाना सेट के लिए अनुकूल।',
        yieldRange: 'उच्च इनपुट धान खेत: अक्सर 55–70 क्विंटल/हे लक्ष्य; क्षेत्र अनुसार बदलता है।',
      }
    ),
    soilNutrition: L(
      {
        soil: 'Heavy textured clay loam to clay ideal for water retention and puddling.',
        ph: '5.5–7.0 typical for lowland rice; manage iron toxicity on problem soils.',
        nutrients: 'Split nitrogen critical; potassium important under dense tillering.',
        npk: 'Basal P/Zn where soils demand; follow soil-test-based K in high yielding systems.',
      },
      {
        soil: 'चिकनी दोमट से चिकनी मिट्टी जल धारण और धस्याई के लिए अच्छी।',
        ph: 'निम्नभूमि धान में अक्सर pH 5.5–7.0; समस्या मिट्टी पर लोह विषाक्तता प्रबंधन।',
        nutrients: 'विभाजित नाइट्रोजन जरूरी; घनी टिलरिंग में पोटाश महत्वपूर्ण।',
        npk: 'जरूरत अनुसार बेसल P/Zn; उच्च उपज में मिट्टी परीक्षण के आधार पर K।',
      }
    ),
    irrigation: L(
      {
        frequency: 'Near continuous shallow flooding or saturated mud in vegetative phase.',
        criticalStages: 'Tillering, panicle initiation, flowering and grain filling.',
        overwatering:
          'Deep stagnant water wastes input and can weaken roots; maintain shallow depth.',
        drought: 'Alternate wetting & drying (AWD) where adopted saves water without sharp yield loss.',
      },
      {
        frequency: 'वनस्पति चरण में खड़ा उथला पानी या संतृप्त कीचड़ बनाए रखें।',
        criticalStages: 'टिलरिंग, पैनिकल प्रारंभ, फूल और दाना भराव।',
        overwatering: 'अत्यधिक गहरा जल बर्बाद और जड़ कमजोर कर सकता है।',
        drought: 'जहाँ अपनाया जाए AWD जल बचाता है और उपज स्थिर रह सकती है।',
      }
    ),
    diseasePest: L(
      {
        diseases: 'Blast, bacterial leaf blight, sheath blight under humid canopies.',
        pests: 'Stem borer, leaf folder, BPH in susceptible varieties.',
        prevention: 'Healthy seedlings, balanced nutrition avoiding excess N, resistant cultivars.',
        organic: 'Neem oil rotations with BT-compatible sprays where permitted.',
        chemical: 'Scout economic thresholds; rotate insecticide classes responsibly.',
      },
      {
        diseases: 'ब्लास्ट, जीवाणु पत्ती झुलसा, आर्द्र छाया में शीथ ब्लाइट।',
        pests: 'तना छेदक, पत्ती लपेटक, संवेदनशील किस्मों में BPH।',
        prevention: 'स्वस्थ रोपे, अत्यधिक N से बचें, प्रतिरोधी किस्में।',
        organic: 'नीम तेल आधारित फेरबदल; अनुमति पर BT-संगत स्प्रे।',
        chemical: 'आर्थिक थ्रेशहोल्ड पर नियंत्रण; इन्सेक्टिसाइड वर्ग घुमाएँ।',
      }
    ),
    weatherCompat: L(
      {
        temp: '24–32 °C favours growth; critical spikelet fertility near flowering under heat stress.',
        rainfall: 'Often >1200 mm effective in rainfed ecologies or complemented by irrigation.',
        humidity: 'High humidity supports growth but raises fungal disease pressure.',
        seasonal: 'Dominant kharif crop across eastern and southern belts.',
      },
      {
        temp: '24–32 °C वृद्धि के लिए अच्छे; फूल पर गर्म तनाव से दाना बंजरता।',
        rainfall: 'वर्षा आधारित क्षेत्रों में अक्सर 1200 mm से अधिक प्रभावी या सिंचाई पूरक।',
        humidity: 'उच्च आर्द्रता वृद्धि सहायक पर कवक रोग बढ़ाती है।',
        seasonal: 'पूर्वी और दक्षिणी भारत में खरीफ की प्रमुख फसल।',
      }
    ),
    marketIntel: L(
      {
        demand: 'Large stable consumption base; parboiled and premium aromatic segments premium priced.',
        priceTrend: 'Volatile around harvest clusters; storage reduces distress exposure.',
        bestSeason: 'Post-kharif arrivals peak varies by state mandi calendars.',
        export: 'Basmati and specialty grades drive export value when traceability met.',
        profit: 'Water and labour costs dominate – efficiency lifts margins.',
      },
      {
        demand: 'विस्तृत स्थिर उपभोग; परबॉयल्ड और सुगंधित प्रीमियम।',
        priceTrend: 'कटाई के समय उतार-चढ़ाव; भंडारण से संकट बिक्री कम।',
        bestSeason: 'राज्यों में खरीफ आवक चोटियाँ अलग-अलग।',
        export: 'बासमती और विशेष ग्रेड ट्रेसेबिलिटी पर निर्यात मूल्य।',
        profit: 'जल और श्रम लागत प्रमुख — दक्षता से मार्जिन बेहतर।',
      }
    ),
    aiRecommendation: L(
      'Given warm humid adaptation and standing-water management, rice achieves high success probability when nursery quality, split nitrogen and drainage around maturity are controlled.',
      'गर्म आर्द्र अनुकूलता और खड़े जल प्रबंधन के साथ, अच्छी नर्सरी, विभाजित नाइट्रोजन और परिपक्वता के आसपास जल निकास से धान की सफलता की संभावना अधिक रहती है।'
    ),
    risks: { disease: 'high', water: 'high', fertilizer: 'medium', weather: 'medium' },
    timeline: L(
      [
        { title: 'Nursery / direct seeding', detail: 'Raise vigorous seedlings or precision direct seeding.' },
        { title: 'Transplanting', detail: 'Young seedlings into puddled field at optimum spacing.' },
        { title: 'Water & N management', detail: 'Maintain shallow flood; split nitrogen applications.' },
        { title: 'Panicle emergence', detail: 'Protect from blast; monitor water depth.' },
        { title: 'Harvest', detail: 'Drain field before maturity; reduce grain moisture losses.' },
      ],
      [
        { title: 'नर्सरी / प्रत्यक्ष बुवाई', detail: 'तंदुरुस्त पौध या सटीक डायरेक्ट सीडिंग।' },
        { title: 'रोपाई', detail: 'धस्याई खेत में युवा पौध उचित दूरी पर।' },
        { title: 'जल और N प्रबंधन', detail: 'उथला बाढ़ जल; नाइट्रोजन विभाजित।' },
        { title: 'बाली निकलना', detail: 'ब्लास्ट से बचाव; जल गहराई देखें।' },
        { title: 'कटाई', detail: 'परिपक्वता से पहले खेत सुखाएँ; नमी नुकसान कम करें।' },
      ]
    ),
    organicTips: L(
      [
        'Azolla / blue-green algal biofertilizers where locally validated.',
        'Composted paddy straw return improves organic matter cycle.',
        'Neem-based botanicals for soft-bodied pests at threshold.',
        'Bird perches and light traps as components of IPM.',
      ],
      [
        'स्थानीय प्रमाणित हो तो अजोला / जीवाणु जैव उर्वरक।',
        'धान की भूसी खाद बनाकर खेत में लौटाने से कार्बन चक्र बेहतर।',
        'नीम आधारित कीटनाशक नरम कीटों पर थ्रेशहोल्ड पर।',
        'पक्षी बैठक और प्रकाश जाल IPM का हिस्सा।',
      ]
    ),
    yieldPrediction: L(
      {
        production: 'Model estimate 52–65 q/ha paddy under good water control.',
        quality: 'Higher head rice recovery with uniform maturity harvest.',
        duration: 'Typically 100–130 days for medium-duration hybrids/varieties.',
      },
      {
        production: 'अच्छे जल प्रबंध पर अनुमानित 52–65 क्विंटल/हे धान।',
        quality: 'समान परिपक्वता पर कटाई से चावल रिकवरी बेहतर।',
        duration: 'मध्यम अवधि किस्मों में लगभग 100–130 दिन।',
      }
    ),
    profitEstimation: L(
      {
        income: 'Strong when water charge low and milling premium captured.',
        investment: 'Higher – nursery/labour/transplant or mechanization costs.',
        stability: 'Demand stable but input price spikes squeeze margins.',
      },
      {
        income: 'जल शुल्क कम और मिलिंग प्रीमियम मिलने पर अच्छा।',
        investment: 'अधिक — नर्सरी/श्रम/रोपाई या यंत्रीकरण।',
        stability: 'मांग स्थिर पर इनपुट महंगाई दबाव डालती है।',
      }
    ),
    aiConfidence: 91,
  },

  maize: {
    overview: L(
      {
        summary:
          'Maize is a versatile C4 cereal responsive to nutrients and population density across kharif and spring windows.',
        whySuitable:
          'Excels on well-drained soils with reliable moisture during silking and grain fill.',
        climate: 'Warm days with adequate sunshine during reproductive stages maximize kernel weight.',
        yieldRange: 'Irrigated hybrids often achieve 80–110 q/ha grain equivalent benchmarks regionally.',
      },
      {
        summary:
          'मक्का लचीला C4 अनाज है — पोषक और पौध घनत्व पर तेज़ प्रतिक्रिया; खरीफ और जायद दोनों में।',
        whySuitable:
          'अच्छी जल निकासी और सिल्किंग व दाना भराव में नियमित नमी पर सर्वोत्तम।',
        climate: 'प्रजनन चरण में गर्म दिन और धूप से दाना भार बढ़ता है।',
        yieldRange: 'सिंचित संकर अक्सर क्षेत्रीय रूप से 80–110 क्विंटल/हे आदर्श।',
      }
    ),
    soilNutrition: L(
      {
        soil: 'Deep sandy loam to loam with excellent drainage.',
        ph: '6.0–7.2 preferred; liming on acidic plots improves micronutrient availability.',
        nutrients: 'High nitrogen and potassium demand near tasseling and grain fill.',
        npk: 'Basal P with starter nitrogen; side-dress remaining N in splits.',
      },
      {
        soil: 'गहरी बलुई दोमट से दोमट, उत्तम जल निकासी।',
        ph: 'pH 6.0–7.2 पसंदीदा; अम्लीय खेत पर चूना सूक्ष्म तत्व बेहतर करता है।',
        nutrients: 'टसलिंग और दाना भराव पर N और K की उच्च मांग।',
        npk: 'बेसल P व प्रारंभिक N; शेष N विभाजित साइड-ड्रेस।',
      }
    ),
    irrigation: L(
      {
        frequency: '6–8 irrigations typical where rainfall incomplete.',
        criticalStages: 'Knee-high, pre-tassel silking, blister and dough.',
        overwatering:
          'Heavy soils prone to temporary waterlogging – affects nodal roots.',
        drought: 'Even short moisture deficit at silking causes irreversible yield loss.',
      },
      {
        frequency: 'अधूरे मानसून में अक्सर 6–8 सिंचाई।',
        criticalStages: 'घुटना ऊँचाई, टसल से पहले/सिल्किंग, ब्लिस्टर, आटा।',
        overwatering: 'भारी मिट्टी में अस्थायी जलभराव गाँठ जड़ों को प्रभावित करता है।',
        drought: 'सिल्किंग पर छोटी नमी कमी भी उपज पर स्थायी असर।',
      }
    ),
    diseasePest: L(
      {
        diseases: 'Turcicum leaf blight, stalk rots in dense humid stands.',
        pests: 'Fall armyworm; stem borer in traditional belts.',
        prevention: 'Correct planting window, refuge strategy for Bt hybrids where used.',
        organic: 'Trap crops, egg mass scouting, nuclear polyhedrosis virus products where registered.',
        chemical: 'Rotate insecticide modes; follow label with pollinator safeguards.',
      },
      {
        diseases: 'टर्सिकम ब्लाइट, घनी नम छाया में तना सड़न।',
        pests: 'फॉल आर्मीवर्म; पारंपरिक क्षेत्रों में तना छेदक।',
        prevention: 'सही बुवाई समय; Bt संकर में शरण रणनीति।',
        organic: 'जाल फसल, अंडे की गिनती, पंजीकृत JNPV उत्पाद।',
        chemical: 'इन्सेक्टिसाइड घुमाव; परागजीव सुरक्षा।',
      }
    ),
    weatherCompat: L(
      {
        temp: '18–27 °C planting establishment; upper 20s–low 30s during grain filling.',
        rainfall: 'Moderate monsoon acceptable if drainage assured.',
        humidity: 'Elevated humidity aids leaf diseases – widen row spacing if needed.',
        seasonal: 'Primary kharif; spring maize where irrigation certain.',
      },
      {
        temp: 'स्थापना में 18–27 °C; दाना भराव में ऊपरी 20–33 °C।',
        rainfall: 'मध्यम मानसून जल निकास के साथ स्वीकार्य।',
        humidity: 'उच्च आर्द्रता पत्ती रोग — जरूरत पर कतार दूरी बढ़ाएँ।',
        seasonal: 'मुख्य खरीफ; जहाँ सिंचित हो वहाँ जायद मक्का।',
      }
    ),
    marketIntel: L(
      {
        demand: 'Feed, starch and ethanol industries diversify outlets.',
        priceTrend: 'Follows poultry sector cycles and mandi arrivals.',
        bestSeason: 'Price peaks sometimes pre-monsoon lean supply periods.',
        export: 'Specialty grades niche; bulk parity linked to global coarse grain tone.',
        profit: 'Hybrid seed cost vs realised grain price sets breakeven hectares.',
      },
      {
        demand: 'फीड, स्टार्च और इथेनॉल उद्योग विविध आउटलेट।',
        priceTrend: 'पोल्ट्री चक्र और मंडी आवक से जुड़ा।',
        bestSeason: 'कभी मानसून से पहले कम आपूर्ति में भाव मजबूत।',
        export: 'विशेष ग्रेड निच; थोक वैश्विक मोटे अनाज से जुड़ा।',
        profit: 'संकर बीज लागत बनाम उत्पादित भाव से ब्रेकईवन।',
      }
    ),
    aiRecommendation: L(
      'Maize shows high yield potential when drainage is sound and moisture never gaps during silking; nutrient splits align with rapid biomass accumulation.',
      'जल निकास अच्छा हो और सिल्किंग में नमी न टूटे तो मक्का में उच्च उपज संभव; तेज़ जैव द्रव्यमान के अनुसार पोषक विभाजन से फायदा।'
    ),
    risks: { disease: 'medium', water: 'medium', fertilizer: 'high', weather: 'medium' },
    timeline: L(
      [
        { title: 'Land prep & sowing', detail: 'Achieve uniform depth and population by planter calibration.' },
        { title: 'Weed control', detail: 'Critical window before knee-high.' },
        { title: 'Nutrition side-dress', detail: 'Apply nitrogen ahead of rapid growth.' },
        { title: 'Silking protection', detail: 'Monitor fall armyworm and foliar diseases.' },
        { title: 'Harvest', detail: 'Harvest at correct grain moisture for storage/market.' },
      ],
      [
        { title: 'तैयारी और बुवाई', detail: 'यंत्र कैलिब्रेशन से एक समान गहराई और घनत्व।' },
        { title: 'खरपतवार नियंत्रण', detail: 'घुटने से पहले का महत्वपूर्ण समय।' },
        { title: 'पोषक साइड-ड्रेस', detail: 'तेज़ वृद्धि से पहले नाइट्रोजन।' },
        { title: 'सिल्किंग संरक्षण', detail: 'फॉल आर्मीवर्म और पत्ती रोग देखें।' },
        { title: 'कटाई', detail: 'भंडारण/बाजार हेतु सही नमी पर कटाई।' },
      ]
    ),
    organicTips: L(
      [
        'Compost or vermicompost to raise CEC in lighter soils.',
        'Biopesticide rotations compatible with IPM thresholds.',
        'Intercropping legumes in wide-row systems where agronomically suited.',
      ],
      [
        'हल्की मिट्टी पर कम्पोस्ट/वर्मीकम्पोस्ट से CEC बढ़ाएँ।',
        'IPM थ्रेशहोल्ड संगत जैव कीटनाशक फेरबदल।',
        'चौड़ी कतार में जहाँ उपयुक्त हो दलहन इंटरक्रॉप।',
      ]
    ),
    yieldPrediction: L(
      {
        production: 'Model estimate 75–95 q/ha grain under hybrid package.',
        quality: 'Uniform kernel size improves grading premiums.',
        duration: '90–115 days common for single-cross hybrids.',
      },
      {
        production: 'संकर पैकेज पर अनुमानित 75–95 क्विंटल/हे दाना।',
        quality: 'समान दाना आकार ग्रेडिंग प्रीमियम में मदद करता है।',
        duration: 'सिंगल-क्रॉस संकरों में अक्सर 90–115 दिन।',
      }
    ),
    profitEstimation: L(
      {
        income: 'Volatile but spikes during poultry feed demand waves.',
        investment: 'Hybrid seed premium plus nutrient-intensive programme.',
        stability: 'Moderate – substitute coarse grains compete in trough periods.',
      },
      {
        income: 'पोल्ट्री फीड मांग की लहरों में उछाल।',
        investment: 'संकर बीज प्रीमियम और पोषक गहन कार्यक्रम।',
        stability: 'मध्यम — अन्य मोटे अनाज प्रतिस्थापन करते हैं।',
      }
    ),
    aiConfidence: 89,
  },

  mustard: {
    overview: L(
      {
        summary:
          'Mustard is an efficient oilseed for rabi with lower water footprint than cereals when timed correctly.',
        whySuitable:
          'Performs on medium fertile soils with cool flowering phase for pod set.',
        climate: 'Requires cool establishment progressing into mild warmth during maturity.',
        yieldRange: 'Good agronomy targets 18–25 q/ha seed depending on variety.',
      },
      {
        summary:
          'सरसों रबी का कुशल तेलबीज है — समय पर प्रबंधन से अनाज की तुलना में पानी कम।',
        whySuitable:
          'मध्यम उपजाऊ मिट्टी और ठंडे फूल के चरण पर फली सेट अच्छा।',
        climate: 'ठंडी स्थापना और परिपक्वता पर हल्की गर्मी चाहिए।',
        yieldRange: 'अच्छे प्रबंधन पर किस्म अनुसार 18–25 क्विंटल/हे बीज।',
      }
    ),
    soilNutrition: L(
      {
        soil: 'Loam to clay loam with fair drainage – avoid extreme waterlogging.',
        ph: '6.0–7.5; sulphur responsive crop – include S in fertilizer plan.',
        nutrients: 'Moderate nitrogen with emphasis on P, K and sulphur balance.',
        npk: 'Avoid excess nitrogen late – promotes lodging and disease.',
      },
      {
        soil: 'दोमट से चिकनी दोमट, उचित जल निकास — जलभराव से बचें।',
        ph: 'pH 6.0–7.5; सल्फर संवेदनशील फसल — योजना में S शामिल करें।',
        nutrients: 'मध्यम नाइट्रोजन; P, K और सल्फर संतुलन पर जोर।',
        npk: 'देर से अत्यधिक N से बचें — गिरावट और रोग बढ़ते हैं।',
      }
    ),
    irrigation: L(
      {
        frequency: 'Rainfed possible in assured zones; otherwise 2–3 critical irrigations.',
        criticalStages: 'Flowering and pod filling most sensitive to moisture stress.',
        overwatering: 'Waterlogging invites root rot and reduces branching.',
        drought: 'Even short stress at flowering slashes seed number.',
      },
      {
        frequency: 'वर्षा आधारित संभव; अन्यथा 2–3 महत्वपूर्ण सिंचाई।',
        criticalStages: 'फूल और बीज भराव पर नमी तनाव सबसे संवेदनशील।',
        overwatering: 'जलभराव जड़ सड़न और शाखाएँ कम करता है।',
        drought: 'फूल पर छोटा तनाव भी बीज संख्या घटाता है।',
      }
    ),
    diseasePest: L(
      {
        diseases: 'Alternaria blight, white rust under humid flowering weather.',
        pests: 'Aphid colonies during stem elongation to flowering.',
        prevention: 'Avoid dense sowing; sulphur nutrition and tolerant varieties.',
        organic: 'Soft soaps / neem formulations at early aphid buildup.',
        chemical: 'Fungicides at recommended intervals when disease forecasts rise.',
      },
      {
        diseases: 'अल्टरनेरिया ब्लाइट, नम फूल मौसम में सफेद जंग।',
        pests: 'तना बढ़ाव से फूल तक एफिड झुंड।',
        prevention: 'घनी बुवाई से बचें; सल्फर पोषण और सहिष्णु किस्में।',
        organic: 'प्रारंभिक एफिड पर नरम साबुन / नीम।',
        chemical: 'रोग पूर्वानुमान पर अनुशंसित अंतराल पर कवकनाशी।',
      }
    ),
    weatherCompat: L(
      {
        temp: '15–22 °C ideal around flowering; frost risk on very early sowings.',
        rainfall: '400–500 mm well distributed supports rainfed stands.',
        humidity: 'Dry ripening aids harvest quality; humid ears invite mould.',
        seasonal: 'Core rabi oilseed across NW and central plains.',
      },
      {
        temp: 'फूल के समय 15–22 °C आदर्श; बहुत जल्दी बुवाई पर पाला जोखिम।',
        rainfall: '400–500 mm समान वितरण वर्षा आधारित के लिए अच्छा।',
        humidity: 'सूखी परिपक्वता कटाई गुणवत्ता में मदद; नम कान पर फफूंद।',
        seasonal: 'उत्तर-पश्चिम और मध्य मैदान में मुख्य रबी तेलबीज।',
      }
    ),
    marketIntel: L(
      {
        demand: 'Linked to edible oil balance sheet and crushing margins.',
        priceTrend: 'Correlates with import parity of palm/soy complex.',
        bestSeason: 'Prices often react pre-festival cooking oil demand spikes.',
        export: 'Organic certified niche consignments possible.',
        profit: 'Strong when seed yield high and oilcontent premiums captured.',
      },
      {
        demand: 'खाद्य तेल संतुलन और क्रशिंग मार्जिन से जुड़ा।',
        priceTrend: 'पाम/सोया आयात समता से सहसंबद्ध।',
        bestSeason: 'त्योहारी खाद्य तेल मांग से पहले भाव प्रतिक्रिया।',
        export: 'प्रमाणित जैव निच खेप संभव।',
        profit: 'बीज उपज और तेल सामग्री प्रीमियम मिलने पर मजबूत।',
      }
    ),
    aiRecommendation: L(
      'Mustard rewards sulphur-balanced nutrition and flowering-stage irrigation discipline; disease pressure rises with humid canopies so spacing matters.',
      'सल्फर संतुलित पोषण और फूल अवस्था की सिंचाई अनुशासन से सरसों लाभ देती है; नम छाया से रोग बढ़ते हैं इसलिए दूरी महत्वपूर्ण है।'
    ),
    risks: { disease: 'medium', water: 'low', fertilizer: 'medium', weather: 'medium' },
    timeline: L(
      [
        { title: 'Field prep & sowing', detail: 'Fine tilth, moderate seed rate for branching.' },
        { title: 'Weed management', detail: 'Early weed-free window critical.' },
        { title: 'Irrigation — flowering', detail: 'Avoid moisture stress when buds form.' },
        { title: 'Disease scouting', detail: 'Alternaria spots – timely fungicide if threshold.' },
        { title: 'Harvest', detail: 'When pods yellow-brown to minimise shattering.' },
      ],
      [
        { title: 'खेत तैयारी और बुवाई', detail: 'बारी मिट्टी, शाखाओं के लिए मध्यम बीज दर।' },
        { title: 'खरपतवार', detail: 'शुरुआती खरपतवार मुक्त खिड़की जरूरी।' },
        { title: 'फूल पर सिंचाई', detail: 'कलियाँ बनते समय नमी तनाव से बचें।' },
        { title: 'रोग निगरानी', detail: 'अल्टरनेरिया धब्बे — थ्रेशहोल्ड पर कवकनाशी।' },
        { title: 'कटाई', detail: 'फलियाँ पीली-भूरी होने पर कटाई से छिड़काव कम।' },
      ]
    ),
    organicTips: L(
      [
        'Sulphur-enriched compost supports yield on S-deficient soils.',
        'Mustard cake soil amendment cautiously – allelopathy awareness.',
        'Crop rotation with cereals breaks pest cycles.',
      ],
      [
        'सल्फर युक्त कम्पोस्ट S-कमी मिट्टी पर मदद करता है।',
        'सरसों की खली सावधानी से — एलीलोपैथी का ध्यान।',
        'अनाज संग फसल चक्र कीट चक्र तोड़ता है।',
      ]
    ),
    yieldPrediction: L(
      {
        production: 'Model estimate 16–22 q/ha seed under recommended sulphur-inclusive nutrition.',
        quality: 'Oil percent rises with timely harvest and uniform ripening.',
        duration: '105–130 days typical for Indian cultivars.',
      },
      {
        production: 'सल्फर सहित पोषण पर अनुमानित 16–22 क्विंटल/हे बीज।',
        quality: 'समय पर कटाई और समान परिपक्वता से तेल प्रतिशत बेहतर।',
        duration: 'भारतीय किस्मों में लगभग 105–130 दिन।',
      }
    ),
    profitEstimation: L(
      {
        income: 'Linked to mandi mustard seed quotes minus logistics.',
        investment: 'Moderate lower than paddy but sulphur fertilizer adds cost.',
        stability: 'Oil complex volatility transmits into seed prices.',
      },
      {
        income: 'मंडी भाव और ढुलाई घटाकर।',
        investment: 'धान से कम पर सल्फर उर्वरक लागत।',
        stability: 'तेल जटिलता बीज भाव में उतार-चढ़ाव लाती है।',
      }
    ),
    aiConfidence: 90,
  },
};

export function getCropInsights(slug) {
  const key = String(slug || '').toLowerCase();
  return CROP_INSIGHTS[key] || null;
}
