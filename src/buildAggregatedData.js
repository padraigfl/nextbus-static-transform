'use strict';

var forceArray = require('./utils/forceArray');

function parseCoordinates(coordinates) {
  return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
}

function addNewStops(routeStops, aggregator) {
  routeStops = forceArray(routeStops);

  // var duplicateCounter = 0;
  routeStops.forEach(function(stop) {
    if (!aggregator[stop.tag]) {
      aggregator[stop.tag] = stop;
    }
    // else {
    //   duplicateCounter += 1;
    // }
  });
  // console.log('Number of duplicate stops ommitted: ' + duplicateCounter);
  return aggregator;
}

function getStops(directions) {
  if(!directions){
    directions = [];
  } else {
    directions = forceArray(directions);
  }
  var stops = {};
  directions.forEach(function(direction) {
    var dirStops = direction.stop.map(function(stop) { return stop.tag; });
    if (direction.name === 'Outbound') {
      if(!stops.outbound) {
        stops.outbound = dirStops;
        return;
      }
    } else if (direction.name === 'Inbound') {
      if(!stops.inbound) {
        stops.outbound = dirStops;
        return;
      }
    }
    stops[direction.title.replace(' ', '_')] =  dirStops;
  });
  if(Object.keys(stops).length === 0){
    return undefined;
  }
  return stops;
}

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
      shortTitle: routeData.route.shortTitle,
      oppositeColor: routeData.route.oppositeColor,
      max: parseCoordinates([routeData.route.latMax, routeData.route.lonMax]),
      min: parseCoordinates([routeData.route.latMin, routeData.route.lonMin]),
      // // TODO: reapply elsewhere with a more useful format
      // scheduleStops: {
      //   inbound: routeSchedule.route[0] ? returnTagValues(routeSchedule.route[0].header.stop) : undefined,
      //   outbound: routeSchedule.route[1] ? returnTagValues(routeSchedule.route[1].header.stop) : undefined
      // },
      stops: getStops(routeData.route.direction),
    };
  } catch (err) {
    throw TypeError(err.message); // eslint-disable-line
  }
  return {
    routes: routeAggregator,
    stops: stopAggregator,
  };
}

module.exports = minifyRouteStopData;
