const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const axios = require('axios');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'jangirparth3@gmail.com' });
    
    if (!user) { console.log('User not found'); process.exit(1); }
    
    console.log('wakatimeApiKey (encrypted):', user.wakatimeApiKey ? 'SET' : 'NOT SET');
    console.log('wakatimeConfiguredAt:', user.wakatimeConfiguredAt);
    
    const decryptedKey = user.getDecryptedWakatimeKey ? user.getDecryptedWakatimeKey() : null;
    console.log('Decrypted key:', decryptedKey ? `${decryptedKey.substring(0, 8)}...` : 'NULL');
    
    if (!decryptedKey) { console.log('ISSUE: Decryption failed or key not set'); process.exit(0); }
    
    // Test the raw WakaTime API call
    const token = Buffer.from(decryptedKey.trim()).toString('base64');
    const res = await axios.get('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
      headers: { Authorization: `Basic ${token}` },
    });
    
    const data = res.data?.data;
    console.log('\n--- WakaTime API Response ---');
    console.log('total_seconds:', data?.total_seconds);
    console.log('daily_average:', data?.daily_average);
    console.log('languages:', data?.languages?.length, 'languages found');
    
    if (data?.total_seconds === 0) {
      console.log('\n⚠️  ISSUE FOUND: total_seconds is 0. The sync guard skips this data.');
      console.log('This means WakaTime has no coding activity for you in the last 7 days.');
    }
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  } finally {
    process.exit(0);
  }
})();
