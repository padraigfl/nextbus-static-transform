/* This script requires the data from the apiCalls script */

var jsonIO = require("./jsonIO.js");
var readJSON = jsonIO.readJSON;
var writeJSON = jsonIO.writeJSON;

var dir = "output";
var routeDataDir = dir + "/routeData";
var aggregatedDir = dir + "/aggregatedData";
var stopPoints = {};
var abbreviatedRoutes = {};

function parseCoordinates(coordinates) {
  return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
};

function getRouteTags(directory) {
  var routesJson = readJSON(`${routeDataDir}/index.json`);
  console.log(routesJson);
  var routeTags = routesJson.route.map(function(route) { return route.tag; });
  return routeTags;
};

function addNewStops(stops) {
  let duplicateCounter = 0;
  stops.map(stop => {
    if (!stopPoints[stop.tag]) stopPoints[stop.tag] = stop;
    else {
      duplicateCounter += 1;
    }
  });
  console.log("Number of duplicate stops ommitted: " + duplicateCounter);
};

function returnTagValues(array) {
  array.map(function(entry) { return entry.tag; });
}

function getRouteStopPoints(directory, routeTag) {
  console.log(routeTag);
  var routeSchedule = readJSON(`${dir}/schedules/${routeTag}.json`)
  try {
    var routeJson = readJSON(`${directory}/${routeTag}.json`, "utf8");
    addNewStops(routeJson.route.stop);
    abbreviatedRoutes[routeJson.route.tag] = {
      title: routeJson.route.title,
      color: routeJson.route.color,
      tag: routeJson.route.tag,
      oppositeColor: routeJson.route.oppositeColor,
      max: parseCoordinates([routeJson.route.latMax, routeJson.route.lonMax]),
      min: parseCoordinates([routeJson.route.latMin, routeJson.route.lonMin]),
      scheduleStops: {
        inbound: returnTagValues(routeSchedule.route[0].header.stop),
        outbound: returnTagValues(routeSchedule.route[1].header.stop)
      },
      stops: routeJson.route.stop.map(function(stop) { return stop.tag })
    };
  } catch (err) {
    console.log(err)
    console.log("No data found for route " + routeTag);
  }
};

var rTags = getRouteTags(routeDataDir);
console.log("============" + rTags.length);
rTags.map(function(tag) { return getRouteStopPoints(routeDataDir, tag); });

writeJSON(`${aggregatedDir}/stops.json`, stopPoints);
writeJSON(`${aggregatedDir}/routes.json`, abbreviatedRoutes);
