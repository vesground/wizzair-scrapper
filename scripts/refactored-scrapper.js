const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));

const telegram = require('integrations/telegram.js');
const fs = require('fs');
const WizzAPI = require('integrations/wizz');
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
    {
      "iata": "MXP",
      "operationStartDate": "2021-08-03T19:20:00",
      "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
      "isDomestic": false,
      "isNew": false
    },
    {
      "iata": "NAP",
      "operationStartDate": "2021-09-16T14:20:00",
      "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
      "isDomestic": false,
      "isNew": true
    },
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

function getNiceTelegramMsg(flightsByConnection) {
  return flightsByConnection
    .map(connectionInfo => {
      const [connection, flights] = Object.entries(connectionInfo)[0];
      const msg = [connection];
      
      return msg
        .concat(flights.map(flight => `${flight.fly_at} - €${flight.price}`))
        .flat()
        .join('\n');
    });
}

async function scrapeWizzPricesForPeriodRange(startAt, endAt) {
  // const map = await WizzApi.getMap();
  // console.info('Successfully extracted a new map.');

  const depDateFrom = getWizzDate(startAt);
  const depDateTo = getWizzDate(endAt);

  const priceRequests = TO_REYKVIAK_MAP
    .map(({iata, connections}) => connections.map(connection => ({departure: iata, arrival: connection.iata})))
    .flat()
    .map(flight => WizzAPI.getPricesPeriod(flight.departure, flight.arrival, depDateFrom, depDateTo));

  const flightsByConnection = await Promise.all(priceRequests);

  // console.log(JSON.stringify(flightsByConnection, null, 2));

  return flightsByConnection;
}

async function main() {
  const timerange = [new Date("2022-09-20"), new Date("2022-10-04")];
  const flightsByConnection = await scrapeWizzPricesForPeriodRange(timerange[0], timerange[1]);
  const telegramMsgs = getNiceTelegramMsg(flightsByConnection);

  telegramMsgs.forEach(msg => {
    telegram.send(msg);
  })
}

main();
