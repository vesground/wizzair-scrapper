const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));

const telegram = require('integrations/telegram.js');
const fs = require('fs');
const WizzAPI = require('integrations/wizz');
const {formatDate} = require('utils.js');
const {FLIGHTS_FROM, FLIGHTS_TO} = require('scripts/connections');

function getWizzDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getNiceTelegramMsg(flightsByConnection) {
  return flightsByConnection
    .map(connectionInfo => {
      const [connection, flights] = Object.entries(connectionInfo)[0];
      const msg = [connection];
      
      return msg
        .concat(flights.map(flight => `${formatDate(flight.fly_at)} - €${flight.price}`))
        .flat()
        .join('\n');
    });
}

async function getWizzPrices(direction, startAt, endAt, maxPrice) {
  // const map = await WizzApi.getMap();
  // console.info('Successfully extracted a new map.');

  const depDateFrom = getWizzDate(startAt);
  const depDateTo = getWizzDate(endAt);

  const priceRequests = direction
    .map(({iata, connections}) => connections.map(connection => ({departure: iata, arrival: connection.iata})))
    .flat()
    .map(flight => WizzAPI.getConnectionPricesForPeriod(flight.departure, flight.arrival, depDateFrom, depDateTo, maxPrice));
  const flightsByConnection = await Promise.all(priceRequests);

  // console.log(JSON.stringify(flightsByConnection, null, 2));

  return flightsByConnection;
}

async function main() {
  const timerange = [new Date("2022-09-20"), new Date("2022-10-04")];
  const maxPrice = 20;

  const flightsToByConnection = await getWizzPrices(FLIGHTS_TO, timerange[0], timerange[1], maxPrice);
  const flightsFromByConnection = await getWizzPrices(FLIGHTS_FROM, timerange[0], timerange[1], maxPrice);

  let introMsg = `Running at ${new Date()}`;

  if (maxPrice) {
    introMsg += `\nFilters:\nmax price - ${maxPrice}`;
  }

  await telegram.send(introMsg)
  await Promise.all(getNiceTelegramMsg(flightsToByConnection).map(msg => telegram.send(msg)));
  await Promise.all(getNiceTelegramMsg(flightsFromByConnection).map(msg => telegram.send(msg)));
}

main();
