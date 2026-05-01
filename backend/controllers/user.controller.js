const User = require('../models/user.model');
const PestScan = require('../models/pestScan.model');

const normalizeList = (values) => {
  if (typeof values === 'string') {
    const text = values.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) values = parsed;
      else values = text.split(',');
    } catch {
      values = text.split(',');
    }
  }
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 30);
};

const inferWeatherRegion = (location = '') => {
  const loc = String(location || '').trim();
  if (!loc) return '';
  const lower = loc.toLowerCase();
  if (lower.includes('punjab') || lower.includes('haryana') || lower.includes('delhi')) return `${loc} (North Plains)`;
  if (lower.includes('rajasthan')) return `${loc} (Arid Zone)`;
  if (lower.includes('maharashtra') || lower.includes('gujarat')) return `${loc} (West Semi-Arid)`;
  if (lower.includes('kerala') || lower.includes('assam') || lower.includes('bengal')) return `${loc} (Humid Zone)`;
  return `${loc} (Regional Zone)`;
};

const mapUserResponse = (user) => {
  const crops = Array.isArray(user.mainCrops) && user.mainCrops.length ? user.mainCrops : user.crops || [];
  const avatar = user.profileImage || user.avatar || '';
  return {
    ...user,
    role: user.role === 'labadmin' ? 'labadmin' : 'farmer',
    language: user.language === 'hi' ? 'hi' : 'en',
    crops,
    mainCrops: crops,
    recommendedCrops: Array.isArray(user.recommendedCrops) ? user.recommendedCrops : [],
    weatherRegion: user.weatherRegion || inferWeatherRegion(user.location),
    avatar,
    profileImage: avatar,
    pestScansCount: Number.isFinite(user.pestScansCount) ? user.pestScansCount : 0,
  };
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId)
      .select(
        'name email phone language role location farmSize crops mainCrops soilType weatherRegion recommendedCrops avatar profileImage pestScansCount createdAt lastLogin'
      )
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Keep a real-time fallback while preserving persisted counter.
    const scannedCount = await PestScan.countDocuments({ userId });
    if (scannedCount > (user.pestScansCount || 0)) {
      await User.updateOne({ _id: userId }, { $set: { pestScansCount: scannedCount } });
      user.pestScansCount = scannedCount;
    }

    const recentScans = await PestScan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('pestName crop severity createdAt')
      .lean();

    const normalized = mapUserResponse(user);
    return res.status(200).json({
      success: true,
      user: normalized,
      stats: {
        totalPestScans: normalized.pestScansCount,
        recommendedCropsCount: normalized.recommendedCrops.length,
        weatherRegion: normalized.weatherRegion || 'N/A',
        lastLogin: normalized.lastLogin,
      },
      recentActivity: recentScans.map((scan) => ({
        type: 'pestScan',
        title: scan.pestName,
        crop: scan.crop || 'General',
        severity: scan.severity,
        createdAt: scan.createdAt,
      })),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const body = req.body || {};
    const updates = {};

    if (typeof body.name === 'string') updates.name = body.name.trim();
    if (typeof body.phone === 'string') updates.phone = body.phone.trim();
    if (typeof body.location === 'string') updates.location = body.location.trim();
    if (typeof body.farmSize === 'string') updates.farmSize = body.farmSize.trim();
    if (typeof body.soilType === 'string') updates.soilType = body.soilType.trim();
    if (typeof body.weatherRegion === 'string') updates.weatherRegion = body.weatherRegion.trim();
    if (body.language === 'hi' || body.language === 'en') updates.language = body.language;

    const parsedCrops = normalizeList(body.mainCrops || body.crops);
    if (parsedCrops.length || Array.isArray(body.mainCrops) || Array.isArray(body.crops)) {
      updates.mainCrops = parsedCrops;
      updates.crops = parsedCrops;
    }

    if (Array.isArray(body.recommendedCrops) || typeof body.recommendedCrops === 'string') {
      updates.recommendedCrops = normalizeList(body.recommendedCrops);
    }

    if (!updates.weatherRegion && typeof updates.location === 'string' && updates.location) {
      updates.weatherRegion = inferWeatherRegion(updates.location);
    }

    if (req.file?.filename) {
      const imagePath = `/uploads/${req.file.filename}`;
      updates.profileImage = imagePath;
      updates.avatar = imagePath;
    } else if (typeof body.profileImage === 'string') {
      updates.profileImage = body.profileImage.trim();
      updates.avatar = body.profileImage.trim();
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
      .select(
        'name email phone language role location farmSize crops mainCrops soilType weatherRegion recommendedCrops avatar profileImage pestScansCount createdAt lastLogin'
      )
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: mapUserResponse(user),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
