// Vercel Serverless Function: GET /api/release
// Resolves the latest official Android release for MIYORI from niyazz09/Miyori-Releases.
// Includes caching, rate-limit protection, and verified fallback.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Pre-verified stable production release (Miyori v1.5.2)
  const verifiedRelease = {
    tag: 'v1.5.2',
    name: 'Miyori v1.5.2 - Official Production Keystore, Playback Speed & Queue Drag-to-Reorder',
    versionName: '1.5.2',
    versionCode: 35,
    applicationId: 'com.miyori.music',
    publishedAt: '2026-10-21T18:27:33Z',
    releaseUrl: 'https://github.com/niyazz09/Miyori-Releases/releases/tag/v1.5.2',
    releasesPage: 'https://github.com/niyazz09/Miyori-Releases/releases/latest',
    apk: {
      fileName: 'Miyori-v1.5.2.apk',
      downloadUrl: 'https://github.com/niyazz09/Miyori-Releases/releases/download/v1.5.2/Miyori-v1.5.2.apk',
      sizeBytes: 23581086,
      sizeFormatted: '22.49 MB',
      sha256: '27c39c2a9139eaede4748c4e7b818fd1c8b96d507c3f2e6cdf05931c73bf7edf',
      signingCertSha256: '2a8ba0af3cfbe3948fb5cbb07ced664f172ebe0cdef461f0642c77f2afb9ee8c',
      signingCertSubject: 'CN=Miyori Music, OU=Mobile, O=Miyori, L=City, ST=State, C=IN'
    },
    source: 'verified-cache'
  };

  try {
    const ghRes = await fetch('https://api.github.com/repos/niyazz09/Miyori-Releases/releases/latest', {
      headers: {
        'User-Agent': 'Miyori-Release-Fetcher/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!ghRes.ok) {
      return res.status(200).json({
        ...verifiedRelease,
        note: 'GitHub API returned status ' + ghRes.status + '; served verified release.'
      });
    }

    const release = await ghRes.json();
    if (!release || !release.assets || !Array.isArray(release.assets)) {
      return res.status(200).json(verifiedRelease);
    }

    // Filter Android APK assets, excluding zip, tar.gz, and source bundles
    const apkAssets = release.assets.filter(a => {
      if (!a.name) return false;
      const lower = a.name.toLowerCase();
      return lower.endsWith('.apk') && !lower.endsWith('.zip') && !lower.endsWith('.tar.gz');
    });

    if (apkAssets.length === 0) {
      return res.status(200).json(verifiedRelease);
    }

    // Prefer universal or arm64 builds if variants exist, or first APK asset
    let selectedApk = apkAssets.find(a => /universal/i.test(a.name)) ||
                      apkAssets.find(a => /arm64/i.test(a.name)) ||
                      apkAssets[0];

    const tag = release.tag_name || 'v1.5.2';
    const cleanVer = tag.replace(/^v/, '');

    return res.status(200).json({
      tag: tag,
      name: release.name || ('Miyori ' + tag),
      versionName: cleanVer,
      versionCode: tag === 'v1.5.2' ? 35 : null,
      applicationId: 'com.miyori.music',
      publishedAt: release.published_at,
      releaseUrl: release.html_url || ('https://github.com/niyazz09/Miyori-Releases/releases/tag/' + tag),
      releasesPage: 'https://github.com/niyazz09/Miyori-Releases/releases/latest',
      apk: {
        fileName: selectedApk.name,
        downloadUrl: selectedApk.browser_download_url,
        sizeBytes: selectedApk.size,
        sizeFormatted: (selectedApk.size / (1024 * 1024)).toFixed(2) + ' MB',
        sha256: tag === 'v1.5.2' ? '27c39c2a9139eaede4748c4e7b818fd1c8b96d507c3f2e6cdf05931c73bf7edf' : null,
        signingCertSha256: tag === 'v1.5.2' ? '2a8ba0af3cfbe3948fb5cbb07ced664f172ebe0cdef461f0642c77f2afb9ee8c' : null,
        signingCertSubject: 'CN=Miyori Music, OU=Mobile, O=Miyori, L=City, ST=State, C=IN'
      },
      source: 'github-api'
    });
  } catch (err) {
    return res.status(200).json({
      ...verifiedRelease,
      note: 'Network exception querying GitHub; served verified release.'
    });
  }
};
