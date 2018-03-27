/* This script requires the data from the apiCalls script */

var jsonIO = require("./jsonIO.js");
var readJSON = jsonIO.readJSON;
var writeJSON = jsonIO.writeJSON;

var dir = "src/output";
var routeDataDir = dir + "/routeData";
var aggregatedDir = dir + "/aggregatedData";

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
  // console.log("Number of duplicate stops ommitted: " + duplicateCounter);
  return aggregator;
};

function returnTagValues(array) {
  return array.map(function(entry) { return entry.tag; });
}

function getRouteStopPoints(routeTag, routeAggregator, stopAggregator, writeDir) {
  console.log(routeTag);
  //var routeSchedule = readJSON(`${writeDir}/${routeTag}.json`)
  var routeSchedule = readJSON(dir+'/schedules/'+routeTag+'.json')
  try {
    var routeJson = readJSON(writeDir+'/'+routeTag+'.json', "utf8");
    stopAggregator = addNewStops(routeJson.route.stop, stopAggregator, writeDir);
    routeAggregator[routeJson.route.tag] = {
      title: routeJson.route.title,
      color: routeJson.route.color,
      tag: routeJson.route.tag,
      oppositeColor: routeJson.route.oppositeColor,
      max: parseCoordinates([routeJson.route.latMax, routeJson.route.lonMax]),
      min: parseCoordinates([routeJson.route.latMin, routeJson.route.lonMin]),
      scheduleStops: {
        inbound: routeSchedule.route[0] ? returnTagValues(routeSchedule.route[0].header.stop) : '',
        outbound: routeSchedule.route[1] ? returnTagValues(routeSchedule.route[1].header.stop) : ''
      },
      stops: {
        inbound: routeJson.route.direction[0] ? routeJson.route.direction[0].stop.map(function(stop) { return stop.tag }) : '',
        outbound: routeJson.route.direction[1] ? routeJson.route.direction[1].stop.map(function(stop) { return stop.tag }) : '',
      },
    };
  } catch (err) {
    console.log(err)
    console.log("No data found for route " + routeTag);
  }
  return {
    routes: routeAggregator,
    stops: stopAggregator,
  }
};

var routesJson = readJSON(`${routeDataDir}/index.json`);
var rTags = getRouteTags(routesJson.route);
console.log("============" + rTags.length);


var stopPoints = {};
var abbreviatedRoutes = {};
var results = rTags.map(function(tag) {
  var collected = getRouteStopPoints(tag, abbreviatedRoutes, stopPoints, routeDataDir);
  stopPoints = collected.stops;
  abbreviatedRoutes = collected.routes;
});

writeJSON(`${aggregatedDir}/stops.json`, stopPoints);
writeJSON(`${aggregatedDir}/routes.json`, abbreviatedRoutes);
