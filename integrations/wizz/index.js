const {fetchMeta, parseMeta} = require('integrations/wizz/meta');
const {asyncRequest, execShellCommand, waitUntil} = require('utils.js');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';

let apiUrl = null;
let hasStartedCookieReq = false;
let cookie = null;

async function getAPIVersionUrl(cache = true, url = 'https://wizzair.com/static_fe/metadata.json') {
  if (apiUrl && cache) return apiUrl;

  const res = await fetchMeta(url);
  const meta = parseMeta(res);

  return meta.apiUrl;
};

async function getCookie(cache = true) {
  if (hasStartedCookieReq && cache) await waitUntil(() => !!cookie);
  if (cookie && cache) return cookie;
  hasStartedCookieReq = true;

  apiUrl = await getAPIVersionUrl();
  // TODO: Use API request
  // const url = apiUrl + '/information/buildNumber';
  // const options = {
  //   url: url,
  //   headers: {
  //     'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  //     'accept-language': 'en-US,en;q=0.9,ro;q=0.8',
  //     'accept-encoding': 'gzip, deflate, br',
  //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
  //     'connection': 'open'
  //   } 
  // };

  try {
    const stdout = await execShellCommand(`sh getWizzCache.sh ${apiUrl}`);
    return stdout.slice(0, -1);
  } catch (error) {
    console.error(`Failed \'sh getWizzCache.sh\' with error: \n${error}`);
  }
}

module.exports = {
  getAPIVersionUrl,
  getCookie,
};
