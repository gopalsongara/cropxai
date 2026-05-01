const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'labadmin'],
      default: 'farmer',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    farmSize: {
      type: String,
      trim: true,
      default: '',
    },
    crops: {
      type: [String],
      default: [],
    },
    mainCrops: {
      type: [String],
      default: [],
    },
    soilType: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    weatherRegion: {
      type: String,
      trim: true,
      default: '',
    },
    recommendedCrops: {
      type: [String],
      default: [],
    },
    pestScansCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('User', userSchema);
