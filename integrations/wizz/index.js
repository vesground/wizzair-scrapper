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

function formatConnection(plan, rawFlights) {
  // {
  //   "KEF -> FCO": [
  //     {
  //       "plan": "KEF -> FCO",
  //       "fly_at": "2022-09-21T19:20:00",
  //       "price": 59.99,
  //       "currency": "EUR"
  //     },
  //     {
  //       "plan": "KEF -> FCO",
  //       "fly_at": "2022-09-23T19:20:00",
  //       "price": 69.99,
  //       "currency": "EUR"
  //     },
  //   ]
  // },

  const flights = rawFlights
    .map(flight => {
      // Implement when:
      // price: null
      if (flight.priceType === 'soldOut') return;

      return flight.departureDates.map(departureDate => ({
        plan,
        fly_at: departureDate,
        price: flight.price.amount,
        currency: flight.price.currencyCode,
      }));
    })
    .filter(Boolean)
    .flat();

  return {
    [plan]: flights
  }
}

async function getConnectionPricesForPeriod(departure, arrival, depDateFrom, depDateTo) {
  apiUrl = await getAPIVersionUrl();
  cookie = await getCookie();

  let payload = {
    'adultCount': 1,
    'childCount': 0,
    'infantCount': 0,
    'flightList':[
      {
        'departureStation': departure,
        'arrivalStation': arrival,
        'from': depDateFrom,
        'to': depDateTo
      }
    ],
    'priceType': 'regular'
  },
  options = {
    method: 'post',
    url: apiUrl + '/search/timetable',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cookie': cookie,
      'user-agent': USER_AGENT
    }
  };

  let res;
  try {
    res = await asyncRequest(options);
  } catch (error) {
    throw Error(`Error on exctracting data for: ${departure}, ${arrival}, ${depDateFrom}, ${depDateTo} \n`, error)
  }

  if (res.statusCode !== 200) {
    throw Error(`Bad status for: ${departure}, ${arrival}, ${depDateFrom}, ${depDateTo} \n`, `Request status ${res.statusCode}`)
  }

  let parsedBody;
  try {
    // outboundFlights: [{
    //   "departureStation": "KEF",
    //   "arrivalStation": "FCO",
    //   "departureDate": "2022-09-23T00:00:00",
    //   "price": {
    //     "amount": 69.99,
    //     "currencyCode": "EUR"
    //   },
    //   "priceType": "price",
    //   "departureDates": [
    //     "2022-09-23T19:20:00"
    //   ],
    //   "classOfService": "L",
    //   "hasMacFlight": false
    // }]
    parsedBody = JSON.parse(res.body);
  } catch (error) {
    throw Error(`Error on parsing data for: ${departure}, ${arrival}, ${depDateFrom}, ${depDateTo} \n`, error)
  }

  console.info(`Successfully extracted data for: ${departure} -> ${arrival}, at ${depDateFrom} - ${depDateTo}`);

  const plan = `${departure} -> ${arrival}`;
  return formatConnection(plan, parsedBody.outboundFlights)
}

module.exports = {
  getAPIVersionUrl,
  getCookie,
  getConnectionPricesForPeriod,
};
