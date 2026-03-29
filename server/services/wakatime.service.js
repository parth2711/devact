const axios = require('axios');

/**
 * 
 * 
 * @param {String} apiKey 
 * @returns {Object|null}  
 */
const getWakatimeStats = async (apiKey) => {
  if (!apiKey) return null;

  try {
    const token = Buffer.from(`${apiKey.trim()}:`).toString('base64');
    
    const response = await axios.get('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
      headers: {
        Authorization: `Basic ${token}`,
      },
    });

    const data = response.data?.data;
    
    if (!data) {
      return null;
    }

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