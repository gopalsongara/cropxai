const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('../models/user.model');

const configureDnsFallback = () => {
  const configuredServers = process.env.MONGO_DNS_SERVERS
    ? process.env.MONGO_DNS_SERVERS.split(',').map((item) => item.trim()).filter(Boolean)
    : ['8.8.8.8', '1.1.1.1'];

  if (configuredServers.length > 0) {
    dns.setServers(configuredServers);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Mongo DNS servers:', configuredServers.join(', '));
    }
  }
};

const connectDB = async () => {
  configureDnsFallback();
  const mongoUri = process.env.MONGO_URI;
  // eslint-disable-next-line no-console
  console.log('Mongo URI Exists:', Boolean(mongoUri));

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB Connected');

    const usersCollection = mongoose.connection.db.collection('users');
    const indexes = await usersCollection.indexes();
    const hasLegacyPhoneIndex = indexes.some((index) => index.name === 'phone_1');
    const hasLegacyUsernameIndex = indexes.some((index) => index.name === 'username_1');

    if (hasLegacyPhoneIndex) {
      await usersCollection.dropIndex('phone_1');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Dropped legacy users.phone_1 index');
      }
    }

    if (hasLegacyUsernameIndex) {
      await usersCollection.dropIndex('username_1');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Dropped legacy users.username_1 index');
      }
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    }

    const roleBackfillResult = await User.updateMany(
      { $or: [{ role: { $exists: false } }, { role: null }, { role: '' }] },
      { $set: { role: 'farmer' } }
    );
    if (roleBackfillResult.modifiedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`Backfilled role=farmer for ${roleBackfillResult.modifiedCount} users`);
    }

    const demoAdminEmail = 'admin@cropai.com';
    const existingAdmin = await User.findOne({ email: demoAdminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'CropAI Lab Admin',
        email: demoAdminEmail,
        password: hashedPassword,
        role: 'labadmin',
      });
      // eslint-disable-next-line no-console
      console.log('Seeded demo lab admin account: admin@cropai.com');
    }

    const demoFarmerEmail = 'farmer@cropai.com';
    const existingFarmer = await User.findOne({ email: demoFarmerEmail });
    if (!existingFarmer) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Demo Farmer',
        email: demoFarmerEmail,
        password: hashedPassword,
        role: 'farmer',
      });
      // eslint-disable-next-line no-console
      console.log('Seeded demo farmer account: farmer@cropai.com');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
