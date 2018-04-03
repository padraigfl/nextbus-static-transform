'use strict';

function parseCoordinates(coordinates) {
  return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
}

function addNewStops(routeStops, aggregator) {
  if (!aggregator) {
    aggregator = {};
  }
  var duplicateCounter = 0;
  routeStops.map(function(stop) {
    if (!aggregator[stop.tag]) {
      aggregator[stop.tag] = stop;
    }
    else {
      duplicateCounter += 1;
    }
  });
  console.log('Number of duplicate stops ommitted: ' + duplicateCounter);
  return aggregator;
};


function minifyRouteStopData(routeData, routeAggregator, stopAggregator) {
  if(!routeAggregator) {
    routeAggregator = {};
  }
  if(!stopAggregator) {
    stopAggregator = {};
  }
  try {
    stopAggregator = addNewStops(routeData.route.stop, stopAggregator);
    routeAggregator[routeData.route.tag] = {
      title: routeData.route.title,
      color: routeData.route.color,
      tag: routeData.route.tag,
      oppositeColor: routeData.route.oppositeColor,
      max: parseCoordinates([routeData.route.latMax, routeData.route.lonMax]),
      min: parseCoordinates([routeData.route.latMin, routeData.route.lonMin]),
      // // TODO: reapply elsewhere with a more useful format
      // scheduleStops: {
      //   inbound: routeSchedule.route[0] ? returnTagValues(routeSchedule.route[0].header.stop) : undefined,
      //   outbound: routeSchedule.route[1] ? returnTagValues(routeSchedule.route[1].header.stop) : undefined
      // },
      stops: {
        inbound: routeData.route.direction[0] ? routeData.route.direction[0].stop.map(function(stop) { return stop.tag; }) : undefined,
        outbound: routeData.route.direction[1] ? routeData.route.direction[1].stop.map(function(stop) { return stop.tag; }) : undefined,
      },
    };
  } catch (err) {
    console.log(err);
    console.log('No data found for route ');
  }
  return {
    routes: routeAggregator,
    stops: stopAggregator,
  };
}

module.exports = minifyRouteStopData;
