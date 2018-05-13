# Nextbus Static Transformer

[![Build Status](https://travis-ci.org/padraigfl/nextbus-static-transform.svg?branch=master)](https://travis-ci.org/padraigfl/nextbus-static-transform)

[![Coverage Status](https://coveralls.io/repos/github/padraigfl/nextbus-static-transform/badge.svg?branch=master)](https://coveralls.io/github/padraigfl/nextbus-static-transform?branch=master) (See: [Coverage](#coverage) )

- [Introduction](#introduction)
- [Initialisation](#initialisation)
- [Functions](#functions)
- [Coverage](#coverage)

## Introduction

This is broken off from a portion of a coding challenge I received where there were issues with the Nextbus API that I felt could be resolved by caching a minified form of all static requests prior to deployment.

The basic goal is to generate a selection of tools which will perform requests to Nextbus and build new data models from them to refer to for either offline use or to reduce the size of requests required.These will deal with what is generally fixed data relating to routes, stops and (potentially) schedules.

## Initialisation

The example.js file contains code which should be able to build data, potentially with some modifications required. This will be modified into a gist at some point instead.

Test requirements are initialised using the `setupTests.js` script, which is ran in advance obfuscates real data into testFile.json so tests can run without needing to deal with an api. As there is inconsistency with the formats used across various services, I've tried to update these constantly to catch outliers.

## Functions

### .api

Pretty straightforward set of axios requests to the necessary Nextbus JSON endpoints

Common parameters are:

- `agency` refers to the agency tag value, which corresponds wth the one from `getAgencies`
- `route` the route tag value, as gotten via `getRouteTags`

Responses will be in json but are written in a JavaScript object format here to increase readability.

#### `getAgencies() -> Object`

Calls `http://webservices.nextbus.com/service/publicJSONFeed?command=agencyList`, returns an object in the following format

```js
{
  agency: [
    {
        title: 'Title',
        regionTitle: 'Region of agency',
        tag: 'e.g. MTA'
    },
    ...
  ],
  copyright:  'Agency copyright info'
}
```

#### `getRoutesTags(agency) -> Object`

Calls `http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&agency=${agency}` to get list of an agencies routes.

Returned object should resemble:

```js
{
  route: [
    {
        title: 'J Line',
        tag: 'J',
    },
    ...
  ],
  copyright:  'Agency copyright info'
}
```

#### `getRoute(agency, route) -> Object`

Calls `http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&agency=${agency}&route=${route}` to get list of an agencies routes.

Response should be in a format of:

```js
{
  route: {
    latMax: 'coordinate',
    latMin: 'coordinate',
    lonMax: 'coordinate',
    lonMin: 'coordinate',
    title: 'title of route',
    tag: 'tag',
    color: 'associated color with route on maps',
    oppositeColor: 'secondary color',
    direction: [ // data regarding various route formats, usually just inbound and outbount
      {
        stop: [
          {
            tag: 'associated stops tag'
          },
          ...
        ],
        title: 'e.g. "inbound to embarcadero"',
        useForUI: 'let me know if you know what this is',
        tag: 'internal ID for route direction',
        name: 'usually just "Inbound" or "Outbound"',
        path: [ // a series of line points which outline the whole route
          {
            point: [
              {
                lat: 'coordinate',
                lon: 'coordinate',
              },
              ...
            ],
            ...
          }
        ]
      }
    ]
  }
}
```

#### `getRouteSchedule(agency, route) -> Object`

Fetches most recent schedule data from API, currently not fully put to its uses in this library.

```js
{
  route: [
    {
      serviceClass: 'wkd', // e.g. is this the weekday schedule
      title: 'route title',
      direction: 'e.g. Outbond',
      header: {//expanded details on stops for use with TR
        stop: {
          content: 'stop name',
          tag: 'stop tag'
        },
        ...
      }
      tr: [ //runs through route broken down
        {
          stop: [ // stops on route with estimated times
            {
              content: '05:50:12', // the start time is usually around 04:30, by the way
              tag: 'bus stop\'s associated tag',
              epochTime: '12345', // timestamp
            }
            ....
          ]
          blockId: 'tag' // tag for this particular circle of the route
        },
        ...
      ],
      scheduleClass: '2018Spring', // rough date of how new the data is
    }
  ]
  copyright: 'agency copyright info'
}
```

### .aggregator

#### `default(routeData, routeAggregator, stopAggregator) -> Object`

- `routeData`: the data for a given route in the API format
- `stopAggregator`: An object which pulls data regarding stops from route data to allow quick access to route information
- `routeAggregator`: Largely just strips the convoluted and inconsistent hierarchy from the existing responses, resulting in a drastically smaller file with almost all the same data

This is to be used in a reducer function, ideally, accumlating the aggregated results as it iterates.

Returns an object containing the updated route and stop aggregators as attributes.

### .geo

#### `buildFeaturesShell() -> Object`

Makes the shell of a FeatureCollection geoJSON object

```js
{
  type: 'FeatureCollection',
  features: [],
};
```

#### `buildRoute(route) -> Objecct`

- `route`: A Nextbus API response for route's details

Uses the coordiantes mentioned above to build a geoJSON of the route, by using FeatureCollection it also allows the retention of some important metadata. Response is to be one entry of a FeaturesCollection object

```js
{
  type: 'Feature',
  properties: {
    title: 'J Line',
    tag: 'J',
    color: '#FFF000',
  },
  geometry: {
    type: 'MultiLineString',
    coordinates: [
      [
        [lat, lon],
        ...
      ],
    ],
  },
}
```

#### `buildStopPoint(stop) -> Object`

- `stop`: As there is no endpoint to get stop data, this requires the aggregated stops object from above.

Utilises geo coordinates from responses to build geojson objects. As with buildRoute, the returned value is an entry for a features collection

```js
{
  type: 'Feature',
  properties: {
    title: 'Stop 152',
    tag: '152',
    color: '#FFF000',
  },
  geometry: {
    type: 'Point',
    coordinates: [
      [lat, lon],
      ...
    ],
  },
}
```

## Coverage

Due to a huge number of very repetitive outliers, coverage is not being extensively thorough. Nextbus is inconsistent with its usage of arrays, anywhere with an array which may have a single result tends to treat the single result as an entity of its own instead of as part of an array
