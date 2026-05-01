const mongoose = require('mongoose');

const pestScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    pestName: {
      type: String,
      required: true,
      trim: true,
    },
    crop: {
      type: String,
      default: 'General',
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    solution: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    symptoms: {
      type: String,
      default: '',
      trim: true,
    },
    treatment: {
      type: String,
      default: '',
      trim: true,
    },
    prevention: {
      type: String,
      default: '',
      trim: true,
    },
    organicSolution: {
      type: String,
      default: '',
      trim: true,
    },
    chemicalSolution: {
      type: String,
      default: '',
      trim: true,
    },
    imageHash: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PestScan', pestScanSchema);
