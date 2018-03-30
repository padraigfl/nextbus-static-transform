/* This operation can be requires:
  - apiCalls to be called for Route Paths
  - apiCalls and buildStopData for Stop Points  */

var io = require("./jsonIO.js");
var readJSON = io.readJSON;
var writeJSON = io.writeJSON;

function buildStopPoints(stopData, outputLocation) {
  var stopPoints = { type: "FeatureCollection", features: [] };

  stopData.forEach(function(stop) {
    stopPoints.features.push({
      type: "Feature",
      properties: {
        title: stop.title
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(stop.lon), parseFloat(stop.lat)]
      }
    })
  });

  writeJSON(outputLocation, stopPoints);
};

function getLineStrings(routePath) {
  return routePath.map(points => {
    var geoPath = points.point.map(function(point) {
      return [parseFloat(point.lon), parseFloat(point.lat)];
    });
    return geoPath;
  });
};

function buildRoute(route) {
  return {
    type: "Feature",
    properties: {
      title: route.route.title,
      tag: route.route.tag,
      color: route.route.color
    },
    geometry: {
      type: "MultiLineString",
      coordinates: getLineStrings(route.route.path)
    }
  }
}

function buildRoutes(routes, directory) {
  var routePaths = { type: "FeatureCollection", features: [] };
  routes.map(function(route) {
    // TODO: replace with API req
    var routeJson = readJSON(`output/routeData/${route}.json`);
    routePaths.features.push(buildRoute(routeJson));
  });
  writeJSON(director, routePaths);
};

var aggregatedStops = readJSON(`${dir}aggregatedData/stops.json`);
var routesJson = readJSON(`${directory}routeData/index.json`);

buildRoutes(routesJson.route.map(route=>route.tag), 'output/geoJSONs/routePaths.geojson');
buildStopPoints(aggregatedStops, 'output/geoJSONS/stops.geojson');
