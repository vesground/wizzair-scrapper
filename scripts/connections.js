const FLIGHTS_FROM = [
  {
    "iata": "KEF",
    "longitude": -22.605555555555558,
    "currencyCode": "EUR",
    "latitude": 63.985,
    "shortName": "Reykjavik",
    "countryName": "Iceland",
    "countryCode": "IS",
    "connections": [
      {
        "iata": "BUD",
        "operationStartDate": "2021-08-03T16:25:00",
        "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "DTM",
        "operationStartDate": "2021-08-03T15:50:00",
        "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
        "isDomestic": false,
        "isNew": false
      },
      // {
      //   "iata": "FCO",
      //   "operationStartDate": "2021-08-02T19:20:00",
      //   "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
      //   "isDomestic": false,
      //   "isNew": true
      // },
      {
        "iata": "GDN",
        "operationStartDate": "2021-08-03T20:50:00",
        "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "KRK",
        "operationStartDate": "2021-10-31T18:15:00",
        "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "KTW",
        "operationStartDate": "2021-08-02T20:45:00",
        "rescueEndDate": "2021-08-01T14:47:30.4959249+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "LTN",
        "operationStartDate": "2021-11-02T22:55:00",
        "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
        "isDomestic": false,
        "isNew": false
      },
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
      {
        "iata": "RIX",
        "operationStartDate": "2021-08-01T20:50:00",
        "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "VIE",
        "operationStartDate": "2021-08-03T17:50:00",
        "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "WAW",
        "operationStartDate": "2021-08-02T00:05:00",
        "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
        "isDomestic": false,
        "isNew": false
      },
      {
        "iata": "WRO",
        "operationStartDate": "2021-08-03T18:50:00",
        "rescueEndDate": "2021-08-01T14:47:30.5115471+01:00",
        "isDomestic": false,
        "isNew": false
      }
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
  },
]
const FLIGHTS_TO = FLIGHTS_FROM
  .map(flight => flight.connections.map(connection => ({
    iata: connection.iata,
    connections: [{
      iata: flight.iata,
      isDomestic: false,
    }]
  })))
  .flat();

module.exports = {
  FLIGHTS_FROM,
  FLIGHTS_TO,
}