'use strict';

var forceArray = require('./utils/forceArray');

function parseCoordinates(coordinates) {
  return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
}

function addStopRoutes(routeTag, directions, aggregator) {
  directions.forEach(function(direction) {
    direction.stop.forEach(function(stop) {
      if (!aggregator[stop.tag].routes[routeTag]){
        aggregator[stop.tag].routes[routeTag] = {};
      }
      aggregator[stop.tag].routes[routeTag][direction.name] = true;
    });
  });
  return aggregator;
}

function addNewStops(routeStops, aggregator) {
  routeStops = forceArray(routeStops);

  // var duplicateCounter = 0;
  routeStops.forEach(function(stop) {
    if (!aggregator[stop.tag]) {
      aggregator[stop.tag] = Object.assign({ routes: {} }, stop);
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
    var dirStops = forceArray(direction.stop).map(function(stop) { return stop.tag; });
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

function addCopyright(routes, stops, copyright) {
  if (!routes.copyright) {
    routes.copyright = copyright;
  }
  if (!stops.copyright) {
    stops.copyright = copyright;
  }
}

function getFirstTime(times){
  for(var i in times){
    if (times[i].epochTime !== '-1') {
      return times[i].content;
    }
  }
  return 'fail';
}

function getRouteScheduleDetails(daySchedule){
  if (daySchedule[0] && Array.isArray(daySchedule[0].stop)) {
    return {
      first: getFirstTime(daySchedule[0].stop),
      last: getFirstTime(daySchedule[daySchedule.length - 1].stop),
    };
  }
}

function getStopTimes(circuits, idx) {
  return circuits.map(function( circuit) {
    return circuit.stop[idx].content;
  }).filter(function(t){
    if(t !== '--'){
      return t;
    }
  });
}

function getTimes(idx, daySchedule) {
  if (daySchedule[0] && Array.isArray(daySchedule[0].stop)) {
    return getStopTimes(daySchedule, idx);
  }
}

//this is way easier with ES6
function addScheduleData(routeTag, scheduleData, routeAggregator, stopAggregator) {
  if(!Array.isArray(scheduleData.route)) {
    scheduleData.route = [scheduleData.route];
  }
  if(routeAggregator[routeTag]) {
    routeAggregator[routeTag].scheduledStops = { // stops that are scheduled
      inbound: Array.isArray(scheduleData.route) && scheduleData.route[0].direction ?
        scheduleData.route[0].header.stop.map(function(stop) { return stop.tag; }) : undefined,
      outbound: Array.isArray(scheduleData.route) && scheduleData.route.length > 1 && scheduleData.route[1].direction ?
        scheduleData.route[1].header.stop.map(function(stop) { return stop.tag; }) : undefined,
    };
  }

  scheduleData.route.forEach(function(day) {
    day.header.stop.forEach(function(stop, idx) { // add list of routes to stop
      if(!stopAggregator[stop.tag]){
        return;
      }
      if(!stopAggregator[stop.tag].scheduleRoutes) {
        stopAggregator[stop.tag].scheduleRoutes = {};
      }
      if(!stopAggregator[stop.tag].scheduleRoutes[routeTag] ) {
        stopAggregator[stop.tag].scheduleRoutes[routeTag] = { };
      }
      if (!stopAggregator[stop.tag].scheduleRoutes[routeTag][day.direction]) {
        stopAggregator[stop.tag].scheduleRoutes[routeTag][day.direction] = {};
      }
      stopAggregator[stop.tag].scheduleRoutes[routeTag][day.direction][day.serviceClass] = getTimes(idx, day.tr);
    });
    if(routeAggregator[routeTag]){
      if(routeAggregator[routeTag].scheduledStops && !routeAggregator[routeTag].scheduledStops[day.direction]){
        routeAggregator[routeTag].scheduledStops[day.direction] = {};
      }
      routeAggregator[routeTag].scheduledStops[day.direction][day.serviceClass] = getRouteScheduleDetails(day.tr); // this makes more sense in routes
    }
  });
  return {
    routes: routeAggregator,
    stops: stopAggregator,
  };
}

function minifyRouteStopData(routeData, routeAggregator, stopAggregator) {
  if(!routeAggregator) {
    routeAggregator = { data: {} };
  }
  if(!stopAggregator) {
    stopAggregator = { data: {} };
  }
  addCopyright(routeAggregator, stopAggregator, routeData.copyright);
  try {
    stopAggregator.data = addNewStops(routeData.route.stop, stopAggregator.data);
    stopAggregator.data = addStopRoutes(routeData.route.tag, routeData.route.direction, stopAggregator.data);
    routeAggregator.data[routeData.route.tag] = {
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

minifyRouteStopData.addScheduleData = addScheduleData;

module.exports = minifyRouteStopData;
