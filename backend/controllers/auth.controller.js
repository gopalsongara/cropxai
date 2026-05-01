const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Temporary debug logs for auth flow verification
    // eslint-disable-next-line no-console
    console.log('REGISTER BODY:', req.body);
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    if (role && role !== 'farmer' && role !== 'labadmin') {
      return res.status(400).json({ success: false, error: 'Invalid role selected' });
    }
    const normalizedRole = role || 'farmer';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPassword, salt);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[REGISTER] Failed', error);
    }
    return res.status(500).json({
      success: false,
      error: 'Register failed',
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Temporary debug logs for auth flow verification
    // eslint-disable-next-line no-console
    console.log('LOGIN BODY:', req.body);
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';
    if (role !== 'farmer' && role !== 'labadmin') {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }
    const normalizedRole = role;
    // eslint-disable-next-line no-console
    console.log('ROLE:', normalizedRole);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('LOGIN INPUT:', normalizedEmail, normalizedPassword);
    }

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    // eslint-disable-next-line no-console
    console.log('FOUND USER:', user);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    // eslint-disable-next-line no-console
    console.log('PASSWORD MATCH:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    const accountRole = user.role === 'labadmin' ? 'labadmin' : 'farmer';
    if (user.role !== accountRole) {
      await User.findByIdAndUpdate(user._id, { $set: { role: accountRole } });
    }
    // eslint-disable-next-line no-console
    console.log('ROLE CHECK:', accountRole, normalizedRole);
    if (accountRole !== normalizedRole) {
      return res.status(401).json({ success: false, error: `Account registered as ${accountRole}` });
    }

    await User.findByIdAndUpdate(user._id, { $set: { lastLogin: new Date() } });

    const token = createToken({ ...user.toObject(), role: accountRole });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: accountRole,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[LOGIN] Failed', error);
    }
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select(
      'name email role phone language location farmSize crops mainCrops soilType weatherRegion recommendedCrops avatar profileImage pestScansCount createdAt lastLogin'
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      plan: user.role === 'labadmin' ? 'Lab Pro' : 'Farmer Basic',
      role: user.role,
      phone: user.phone || '',
      language: user.language || 'en',
      location: user.location || '',
      farmSize: user.farmSize || '',
      crops: Array.isArray(user.mainCrops) && user.mainCrops.length ? user.mainCrops : Array.isArray(user.crops) ? user.crops : [],
      mainCrops: Array.isArray(user.mainCrops) && user.mainCrops.length ? user.mainCrops : Array.isArray(user.crops) ? user.crops : [],
      recommendedCrops: Array.isArray(user.recommendedCrops) ? user.recommendedCrops : [],
      soilType: user.soilType || '',
      weatherRegion: user.weatherRegion || '',
      avatar: user.profileImage || user.avatar || '',
      profileImage: user.profileImage || user.avatar || '',
      pestScansCount: Number.isFinite(user.pestScansCount) ? user.pestScansCount : 0,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[AUTH_ME] Failed', error);
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
