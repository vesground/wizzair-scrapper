const {fetchMeta, parseMeta} = require('integrations/wizz/meta');

const apiUrl = null;

async function getAPIVersionUrl(cache = true, url = 'https://wizzair.com/static_fe/metadata.json') {
  if (state.apiUrl && cache) return state.apiUrl;

  const res = await fetchMeta(url);
  const meta = parseMeta(res);

  return meta.apiUrl;
};

module.exports = {
  getAPIVersionUrl,
};
