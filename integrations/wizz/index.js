const {fetchMeta, parseMeta} = require('integrations/wizz/meta');
const connection = require('integrations/wizz/connection');
const {waitUntil, asyncRequest} = require('utils.js');

let apiUrl = null;
let hasStartedCookieReq = false;
let cookie = null;

async function getAPIVersionUrl(cache = true, url = 'https://wizzair.com/static_fe/metadata.json') {
  if (apiUrl && cache) return apiUrl;

  const res = await fetchMeta(url);
  const meta = parseMeta(res);

  return meta.apiUrl;
};

function getAK_BMSC(cookies) {
  const cookie = cookies.find(c => c.startsWith('ak_bmsc'))

  if (!cookie) throw Error('Cookie is empty');

  return cookie; 
}

async function getCookie(cache = true) {
  if (hasStartedCookieReq && cache) await waitUntil(() => !!cookie);
  if (cookie && cache) return cookie;
  hasStartedCookieReq = true;

  apiUrl = await getAPIVersionUrl();
  // TODO: Use API request
  const url = apiUrl + '/information/buildNumber';
  const options = {
    url: url,
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9,ro;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
      'connection': 'open'
    } 
  };

  let cookies;
  try {
    cookies = (await asyncRequest(options)).headers['set-cookie'];
  } catch (error) {
    throw Error(`Error fetching cookies \n`, error)
  }

  return getAK_BMSC(cookies);
}

async function getConnectionPricesForPeriod(departure, arrival, depDateFrom, depDateTo, maxPrice) {
  apiUrl = await getAPIVersionUrl();
  cookie = await getCookie();

  let outboundFlights = await connection.fetchForPeriod(apiUrl, cookie, {departure, arrival, depDateFrom, depDateTo});

  if (maxPrice) {
    outboundFlights = connection.filterByMaxPrice(outboundFlights, maxPrice);
  }

  const plan = `${departure} -> ${arrival}`;
  return connection.format(plan, outboundFlights)
}

module.exports = {
  getAPIVersionUrl,
  getCookie,
  getConnectionPricesForPeriod,
};
