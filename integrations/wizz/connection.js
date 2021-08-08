const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
const {asyncRequest} = require('utils.js');

function format(plan, rawFlights) {
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
      return flight.departureDates.map(departureDate => ({
        plan,
        fly_at: departureDate,
        price: flight.price.amount,
        currency: flight.price.currencyCode,
      }));
    })
    .flat();

  return {
    [plan]: flights
  }
}

async function fetchForPeriod(apiUrl, cookie, params = {}) {
  let payload = {
    'adultCount': 1,
    'childCount': 0,
    'infantCount': 0,
    'flightList':[
      {
        'departureStation': params.departure,
        'arrivalStation': params.arrival,
        'from': params.depDateFrom,
        'to': params.depDateTo
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
    throw Error(`Error on exctracting data for: ${params.departure}, ${params.arrival}, ${params.depDateFrom}, ${params.depDateTo} \n`, error)
  }

  if (res.statusCode !== 200) {
    throw Error(`Bad status for: ${params.departure}, ${params.arrival}, ${params.depDateFrom}, ${params.depDateTo} \n`, `Request status ${res.statusCode}`)
  }

  let outboundFlights;
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
    outboundFlights = JSON.parse(res.body).outboundFlights;
  } catch (error) {
    throw Error(`Error on parsing data for: ${params.departure}, ${params.arrival}, ${params.depDateFrom}, ${params.depDateTo} \n`, error)
  }

  console.info(`Successfully extracted data for: ${params.departure} -> ${params.arrival}, at ${params.depDateFrom} - ${params.depDateTo}`);

  return filterOutSoldout(outboundFlights);
}

function filterOutSoldout(flights) {
  // Implement when:
  // price: null
  return flights.filter(flight => flight.priceType !== 'soldOut');
}

function filterByMaxPrice(flights, maxPrice) {
  return flights.filter(flight => flight.price.amount < maxPrice);
}

module.exports = {
  format,
  fetchForPeriod,
  filterByMaxPrice
}