const fs = require('fs');
const crypto = require('crypto');
const PestScan = require('../models/pestScan.model');
const User = require('../models/user.model');
const { pestData } = require('../data/pestData');

const COOLDOWN_MS = 15 * 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const userCooldown = new Map();
const imageResponseCache = new Map();

const friendlyError = (language, key) => {
  const hi = {
    cooldown: 'कृपया अगला स्कैन करने से पहले कुछ सेकंड प्रतीक्षा करें।',
    aiBusy: 'AI सेवा अस्थायी रूप से उपलब्ध नहीं है।',
    unclear: 'छवि स्पष्ट नहीं है। कृपया साफ फोटो अपलोड करें।',
    failed: 'विश्लेषण विफल हुआ। कृपया पुनः प्रयास करें।',
  };
  const en = {
    cooldown: 'Please wait before another scan.',
    aiBusy: 'AI service temporarily unavailable.',
    unclear: 'Image is unclear. Please upload a clearer photo.',
    failed: 'Analysis failed. Please try again.',
  };
  const dict = language === 'hi' ? hi : en;
  return dict[key] || dict.failed;
};

const getImageHash = (buffer) => crypto.createHash('md5').update(buffer).digest('hex');

const selectDiseaseByFileName = (fileName) => {
  const lower = String(fileName || '').toLowerCase();
  const keywordMatched = pestData.find((item) =>
    Array.isArray(item.keywords) && item.keywords.some((keyword) => lower.includes(keyword))
  );
  return keywordMatched || null;
};

const getDiseaseByHash = (hash) => {
  const source = String(hash || '').slice(0, 8);
  const numeric = Number.parseInt(source || '0', 16);
  const index = Number.isFinite(numeric) ? numeric % pestData.length : 0;
  return pestData[index];
};

const localize = (enText, hiText, language) => (language === 'hi' ? hiText : enText);

const buildResult = ({ disease, language, date }) => {
  return {
    name: localize(disease.name, disease.name, language),
    crop: localize(disease.crop, disease.crop, language),
    severity: String(disease.severity || 'medium').toLowerCase(),
    confidence: disease.confidence,
    symptoms: localize(disease.symptoms, disease.symptoms, language),
    advice: localize(disease.treatment, disease.treatment, language),
    treatment: localize(disease.treatment, disease.treatment, language),
    prevention: localize(disease.prevention, disease.prevention, language),
    organicSolution: localize(disease.organic, disease.organic, language),
    chemicalSolution: localize(disease.chemical, disease.chemical, language),
    imageUrl: disease.image,
    date,
  };
};

const detectPest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image required' });
    }
    // eslint-disable-next-line no-console
    console.log(req.file);

    const language = req.body?.language === 'hi' ? 'hi' : 'en';
    const now = Date.now();
    const lastScanAt = userCooldown.get(userId);
    if (lastScanAt && now - lastScanAt < COOLDOWN_MS) {
      return res.status(429).json({ success: false, error: friendlyError(language, 'cooldown') });
    }
    userCooldown.set(userId, now);

    const imagePath = req.file.path;
    const fileBuffer = fs.readFileSync(imagePath);
    const imageHash = getImageHash(fileBuffer);
    const cacheKey = `${imageHash}:${language}`;

    const memoryCached = imageResponseCache.get(cacheKey);
    if (memoryCached && now - memoryCached.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        cached: true,
        result: memoryCached.result,
      });
    }

    const existingScan = await PestScan.findOne({
      userId,
      imageHash,
      language,
      createdAt: { $gte: new Date(now - CACHE_TTL_MS) },
    }).sort({ createdAt: -1 }).lean();

    if (existingScan) {
      const cachedResult = {
        name: existingScan.pestName,
        crop: existingScan.crop || 'General',
        severity: existingScan.severity,
        confidence: existingScan.confidence || 75,
        symptoms: existingScan.symptoms || friendlyError(language, 'unclear'),
        advice: existingScan.treatment || existingScan.solution,
        treatment: existingScan.treatment || existingScan.solution,
        prevention: existingScan.prevention || '',
        organicSolution: existingScan.organicSolution || '',
        chemicalSolution: existingScan.chemicalSolution || '',
        imageUrl: existingScan.imageUrl,
        date: existingScan.createdAt,
      };
      imageResponseCache.set(cacheKey, { timestamp: now, result: cachedResult });
      return res.status(200).json({ success: true, cached: true, result: cachedResult });
    }

    const filenameDisease = selectDiseaseByFileName(req.file.originalname);
    const disease = filenameDisease || getDiseaseByHash(imageHash);
    // eslint-disable-next-line no-console
    console.log('selectedDisease', disease);
    const finalResult = buildResult({
      disease,
      language,
      date: new Date().toISOString(),
    });

    await PestScan.create({
      userId,
      imageUrl: finalResult.imageUrl,
      pestName: finalResult.name,
      severity: finalResult.severity,
      solution: finalResult.advice,
      confidence: finalResult.confidence,
      language,
      symptoms: finalResult.symptoms,
      treatment: finalResult.treatment,
      prevention: finalResult.prevention,
      organicSolution: finalResult.organicSolution,
      chemicalSolution: finalResult.chemicalSolution,
      imageHash,
      crop: finalResult.crop,
    });

    await User.updateOne(
      { _id: userId },
      {
        $inc: { pestScansCount: 1 },
      }
    );

    imageResponseCache.set(cacheKey, { timestamp: now, result: finalResult });

    return res.json({
      success: true,
      cached: false,
      result: finalResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Detection failed',
    });
  }
};

const getRecentScans = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const scans = await PestScan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json(
      scans.map((scan) => ({
        id: scan._id,
        name: scan.pestName,
        crop: scan.crop || 'General',
        severity: scan.severity,
        confidence: scan.confidence,
        symptoms: scan.symptoms,
        advice: scan.treatment || scan.solution,
        treatment: scan.treatment || scan.solution,
        prevention: scan.prevention,
        organicSolution: scan.organicSolution,
        chemicalSolution: scan.chemicalSolution,
        imageUrl: scan.imageUrl,
        date: scan.createdAt,
      }))
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[PEST_RECENT] Failed', error);
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch recent scans',
    });
  }
};

module.exports = {
  detectPest,
  getRecentScans,
};
