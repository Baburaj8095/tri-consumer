const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidUpiQueries(config) {
  return withAndroidManifest(config, configWithManifest => {
    const manifest = configWithManifest.modResults.manifest;
    manifest.queries = manifest.queries || [];
    const hasUpiQuery = manifest.queries.some(query =>
      Array.isArray(query.intent) && query.intent.some(intent =>
        Array.isArray(intent.data) && intent.data.some(data => data.$?.['android:scheme'] === 'upi')));
    if (!hasUpiQuery) {
      manifest.queries.push({
        intent: [{
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'upi' } }],
        }],
      });
    }
    return configWithManifest;
  });
};
