const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['weather', 'market', 'crop', 'pest', 'smart'],
    },
    titleEn: { type: String, required: true, trim: true },
    titleHi: { type: String, required: true, trim: true },
    messageEn: { type: String, required: true, trim: true },
    messageHi: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    dedupeKey: { type: String, required: true, trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, dedupeKey: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);
