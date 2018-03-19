/* This operation can be requires:
  - apiCalls to be called for Route Paths
  - apiCalls and buildStopData for Stop Points  */

var { readJSON, writeJSON } = require("./jsonIO.js");

var stopPoints = { type: "FeatureCollection", features: [] };
var routePaths = { type: "FeatureCollection", features: [] };
var dir = "output/";
var routeDataDir = dir + "routeData/";
var aggregatedDir = dir + "aggregatedData/";

function buildStopPoints(directory) {
  stopJson = readJSON(`${directory}aggregatedData/stops.json`);
  for (var i in stopJson) {
    console.log(i);
    stopPoints.features.push({
      type: "Feature",
      properties: {
        title: stopJson[i].title
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(stopJson[i].lon), parseFloat(stopJson[i].lat)]
      }
    });
  }
  writeJSON(`${directory}geoJSONS/stops.geojson`, stopPoints);
};

function getLineStrings(routePath) {
  return routePath.map(points => {
    var geoPath = points.point.map(function(point) {
      return [parseFloat(point.lon), parseFloat(point.lat)];
    });
    return geoPath;
  });
};

function buildRoutes(directory) {
  routesJson = readJSON(`${directory}routeData/index.json`);
  routesJson.route.map(function(route) {
    var routeJson = readJSON(`${directory}routeData/${route.tag}.json`);
    routePaths.features.push({
      type: "Feature",
      properties: {
        title: routeJson.route.title,
        tag: routeJson.route.tag,
        color: routeJson.route.color
      },
      geometry: {
        type: "MultiLineString",
        coordinates: getLineStrings(routeJson.route.path)
      }
    });
  });
  writeJSON(`${directory}geoJSONs/routePaths.geojson`, routePaths);
};

buildRoutes(dir);
buildStopPoints(dir);
