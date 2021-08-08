const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));

const telegram = require('integrations/telegram.js');
const fs = require('fs');
const WizzApiFactory = require('integrations/wizzair.js');
const WizzApi = new WizzApiFactory();
const {strMapToObj} = require('utils.js');

function getWizzDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

const TO_REYKVIAK_MAP = [{
  "iata": "KEF",
  "longitude": -22.605555555555558,
  "currencyCode": "EUR",
  "latitude": 63.985,
  "shortName": "Reykjavik",
  "countryName": "Iceland",
  "countryCode": "IS",
  "connections": [
    // {
    //   "iata": "BUD",
    //   "operationStartDate": "2021-08-03T16:25:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "DTM",
    //   "operationStartDate": "2021-08-03T15:50:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    {
      "iata": "FCO",
      "operationStartDate": "2021-08-02T19:20:00",
      "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
      "isDomestic": false,
      "isNew": true
    },
    // {
    //   "iata": "GDN",
    //   "operationStartDate": "2021-08-03T20:50:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "KRK",
    //   "operationStartDate": "2021-10-31T18:15:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "KTW",
    //   "operationStartDate": "2021-08-02T20:45:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "LTN",
    //   "operationStartDate": "2021-11-02T22:55:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "MXP",
    //   "operationStartDate": "2021-08-03T19:20:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "NAP",
    //   "operationStartDate": "2021-09-16T14:20:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": true
    // },
    // {
    //   "iata": "RIX",
    //   "operationStartDate": "2021-08-01T20:50:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "VIE",
    //   "operationStartDate": "2021-08-03T17:50:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "WAW",
    //   "operationStartDate": "2021-08-02T00:05:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // },
    // {
    //   "iata": "WRO",
    //   "operationStartDate": "2021-08-03T18:50:00",
    //   "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
    //   "isDomestic": false,
    //   "isNew": false
    // }
  ],
  "aliases": [
    "Reykjavík"
  ],
  "isExcludedFromGeoLocation": false,
  "rank": 1,
  "categories": [
    2,
    3,
    4,
    0
  ]
}];

function getNiceTelegramMsg(prices, connectionNames) {
  return prices
    .map((connection, i) => Object.values(connection).map(dayFlights => Object.entries(dayFlights).map(dayFlight => dayFlight.join(' - €'))).flat().unshift(connectionNames[i]))
    .flat()
    .join('\n');
}

async function scrapeWizzPricesForPeriodRange(startAt, endAt) {
  // const map = await WizzApi.getMap();
  // console.info('Successfully extracted a new map.');
  const map = TO_REYKVIAK_MAP;

  let prices = [];
  const depDateFrom = getWizzDate(startAt);
  const depDateTo = getWizzDate(endAt);

  for (let depObj of map) {
    const departure = depObj.iata;

    for (let arrObj of depObj.connections) {
      const arrival = arrObj.iata;

      try {
        const connectionPrices = await WizzApi.getAndPopulatePricesPeriod(departure, arrival, depDateFrom, depDateTo);
        console.info('Successfully extracted and stored data for: ', departure, arrival, depDateFrom, depDateTo);
        prices.push(strMapToObj(connectionPrices));
      } catch(e) {
        console.error('Error on exctracting data for: ', departure, arrival, depDateFrom, depDateTo, e);
      }
    }
  }

  console.log(prices);

  return prices;
}

async function main() {
  const timerange = [new Date("2022-09-20"), new Date("2022-10-04")];
  const prices = await scrapeWizzPricesForPeriodRange(timerange[0], timerange[1]);
  await telegram.send(getNiceTelegramMsg(prices, TO_REYKVIAK_MAP.map(airport => airport.connections.map(connection => connection.iata)).flat()));
}

main();