module.exports = async function handler(req, res) {
  // Polyfill status and json for local testing or custom server environments
  if (!res.status) {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(data));
      return this;
    };
  }

  // Parse query parameters
  let isJson = false;
  if (req.query && req.query.json === '1') {
    isJson = true;
  } else if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      if (parsedUrl.searchParams.get('json') === '1') {
        isJson = true;
      }
    } catch (_) {}
  }

  const fallbackRedirectUrl = 'https://github.com/niyazz09/Miyori-Releases/releases/latest';

  try {
    const headers = {
      'User-Agent': 'Miyori-Latest-Release-Resolver/1.0',
      'Accept': 'application/vnd.github+json'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const ghRes = await fetch('https://api.github.com/repos/niyazz09/Miyori-Releases/releases/latest', {
      headers
    });

    if (!ghRes.ok) {
      console.error(`[api/latest] GitHub API responded with status ${ghRes.status}: ${ghRes.statusText}`);
      if (isJson) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(502).json({
          error: 'GitHub API error',
          status: ghRes.status,
          message: ghRes.statusText
        });
      }
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Location', fallbackRedirectUrl);
      return res.status(302).end();
    }

    const release = await ghRes.json();
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const apkAssets = assets.filter(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk'));

    if (apkAssets.length === 0) {
      console.error(`[api/latest] No APK assets found in release ${release.tag_name}`);
      if (isJson) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(502).json({
          error: 'No APK assets found in latest release',
          release: release.tag_name
        });
      }
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Location', release.html_url || fallbackRedirectUrl);
      return res.status(302).end();
    }

    // "the first asset whose name ends with .apk; if several, prefer one whose name contains 'release' or 'miyori'; log which one was chosen."
    let chosenAsset = apkAssets[0];
    if (apkAssets.length > 1) {
      const preferred = apkAssets.find(a => {
        const lower = a.name.toLowerCase();
        return lower.includes('release') || lower.includes('miyori');
      });
      if (preferred) chosenAsset = preferred;
    }

    console.log(`[api/latest] Selected APK asset: "${chosenAsset.name}" (${chosenAsset.size} bytes) for release ${release.tag_name}`);

    // Parse SHA-256 digest if present (from asset.digest if it starts with "sha256:", else null)
    let sha256 = null;
    if (chosenAsset.digest && typeof chosenAsset.digest === 'string' && chosenAsset.digest.toLowerCase().startsWith('sha256:')) {
      sha256 = chosenAsset.digest.substring(7).trim();
    }

    // Notes: body truncated to about 1,200 chars
    let notes = release.body || '';
    if (notes.length > 1200) {
      notes = notes.substring(0, 1200) + '...';
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (isJson) {
      return res.status(200).json({
        version: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at,
        notes: notes,
        assetName: chosenAsset.name,
        sizeBytes: chosenAsset.size,
        sha256: sha256,
        downloadUrl: chosenAsset.browser_download_url,
        releaseUrl: release.html_url || `https://github.com/niyazz09/Miyori-Releases/releases/tag/${release.tag_name}`
      });
    }

    res.setHeader('Location', chosenAsset.browser_download_url);
    return res.status(302).end();

  } catch (err) {
    console.error('[api/latest] Unhandled serverless execution error:', err);
    if (isJson) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json({
        error: 'Failed to resolve latest release',
        details: err.message
      });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', fallbackRedirectUrl);
    return res.status(302).end();
  }
};
