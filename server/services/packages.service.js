const axios = require('axios');

/**
 * Fetch weekly download stats for npm and PyPI packages.
 * 
 * @param {Array<String>} npmList - Array of npm package names (max 10)
 * @param {Array<String>} pypiList - Array of PyPI package names (max 10)
 */
const getPackageStats = async (npmList = [], pypiList = []) => {
  const stats = {
    npm: [],
    pypi: [],
  };

  try {
    // ---- npm (Bulk Fetch) ----
    if (npmList.length > 0) {
      // Bulk endpoint: https://api.npmjs.org/downloads/point/last-week/pkg1,pkg2
      const npmQuery = npmList.join(',');
      const npmRes = await axios.get(`https://api.npmjs.org/downloads/point/last-week/${npmQuery}`);
      
      const npmData = npmRes.data;

      // When querying multiple packages, the API returns { "pkg1": { downloads: 100 }, "pkg2": ... }
      // When querying a single package, it returns { downloads: 100, package: "pkg1" } directly.
      if (npmList.length === 1) {
        if (npmData && npmData.downloads !== undefined) {
          stats.npm.push({ name: npmData.package, weeklyDownloads: npmData.downloads });
        }
      } else {
        Object.keys(npmData).forEach((pkgName) => {
          // If a package is invalid or not found, npm might return null for it in the bulk dictionary
          if (npmData[pkgName] && npmData[pkgName].downloads !== undefined) {
            stats.npm.push({ name: pkgName, weeklyDownloads: npmData[pkgName].downloads });
          }
        });
      }
    }

    // ---- PyPI (Concurrent Mapping) ----
    if (pypiList.length > 0) {
      // pypistats.org does not have a bulk endpoint, so we use Promise.all internally
      const pypiPromises = pypiList.map(async (pkg) => {
        try {
          const res = await axios.get(`https://pypistats.org/api/packages/${pkg}/recent`);
          // The API returns { data: { last_day, last_month, last_week } }
          const weeklyDownloads = res.data?.data?.last_week || 0;
          return { name: pkg, weeklyDownloads };
        } catch (err) {
          console.error(`[Sync] PyPI fetch failed for ${pkg}:`, err.message);
          return null;
        }
      });

      const pypiResults = await Promise.all(pypiPromises);
      stats.pypi = pypiResults.filter((r) => r !== null);
    }

  } catch (error) {
    console.error('[Sync] Packages fetch error:', error.message);
    throw new Error('Failed to fetch package stats');
  }

  return stats;
};

module.exports = { getPackageStats };
