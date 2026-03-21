const axios = require('axios');

/**
 * Fetch WakaTime stats for the last 7 days using the user's decrypted API key.
 * Converts base64 encoded strings to standard authentication headers if necessary.
 * 
 * @param {String} apiKey - The decrypted WakaTime API key
 * @returns {Object|null}   Returns null if key is invalid, data is empty (lag guard), or request fails.
 */
const getWakatimeStats = async (apiKey) => {
  if (!apiKey) return null;

  try {
    // WakaTime expects the API key as a Base64-encoded Basic Auth string, OR custom header.
    // The easiest reliable way is basic auth where username is the api key and password is empty.
    const token = Buffer.from(apiKey.trim()).toString('base64');
    
    const response = await axios.get('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
      headers: {
        Authorization: `Basic ${token}`,
      },
    });

    const data = response.data?.data;
    
    // Explicit guard against partial/0-second data returns when a user connects for the first time
    if (!data || data.total_seconds === 0) {
      console.warn('[Sync] WakaTime returned 0 total_seconds. Skipping to guard against lag drops.');
      return null;
    }

    // Format languages slightly to keep it clean for the DB cache, only keeping top ones
    const languages = (data.languages || []).slice(0, 10).map((lang) => ({
      name: lang.name,
      percent: lang.percent,
      total_seconds: lang.total_seconds,
    }));

    return {
      totalSeconds: data.total_seconds,
      dailyAverage: data.daily_average,
      languages,
    };
  } catch (error) {
    console.error('[Sync] WakaTime fetch error:', error.response?.data || error.message);
    throw new Error('Failed to fetch WakaTime stats');
  }
};

module.exports = { getWakatimeStats };
