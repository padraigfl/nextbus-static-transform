/* This script requires the data from the apiCalls script */

var jsonIO = require("./jsonIO.js");
var readJSON = jsonIO.readJSON;
var writeJSON = jsonIO.writeJSON;

function parseCoordinates(coordinates) {
  return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
};

function getRouteTags(routes) {
  return routes.map(function(route) { return route.tag; });
};

function addNewStops(routeStops, aggregator) {
  if (!aggregator) {
    aggregator = {}
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
  console.log("Number of duplicate stops ommitted: " + duplicateCounter);
  return aggregator;
};

function returnTagValues(array) {
  return array.map(function(entry) { return entry.tag; });
}

function getRouteStopPoints(routeData, routeAggregator, stopAggregator, writeDir) {
  try {
    stopAggregator = addNewStops(routeData.route.stop, stopAggregator, writeDir);
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
        inbound: routeData.route.direction[0] ? routeData.route.direction[0].stop.map(function(stop) { return stop.tag }) : undefined,
        outbound: routeData.route.direction[1] ? routeData.route.direction[1].stop.map(function(stop) { return stop.tag }) : undefined,
      },
    };
  } catch (err) {
    console.log(err)
    console.log("No data found for route ");
  }
  return {
    routes: routeAggregator,
    stops: stopAggregator,
  }
};

var dir = "src/output";
var routeDataDir = dir + "/routeData";
var aggregatedDir = dir + "/aggregatedData";

var routesJson = readJSON(`${routeDataDir}/index.json`);
var rTags = getRouteTags(routesJson.route);
console.log("============" + rTags.length);

var results = rTags.reduce(function(acc, tag) {
  console.log(tag);
  var routeJson = readJSON(routeDataDir+'/'+tag+'.json', "utf8");//todo, export logic
  return getRouteStopPoints(routeJson, acc.routes, acc.stops, routeDataDir);
}, { stops: {}, routes: {}});

writeJSON(`${aggregatedDir}/stops.json`, results.stops);
writeJSON(`${aggregatedDir}/routes.json`, results.routes);
