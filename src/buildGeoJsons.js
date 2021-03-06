/* This operation can be requires:
  - apiCalls to be called for Route Paths
  - apiCalls and buildStopData for Stop Points  */
'use strict';

var forceArray = require('./utils/forceArray');

function buildStopPoint(stop) {
  return {
    type: 'Feature',
    properties: {
      title: stop.title,
      tag: stop.tag,
      stopId: stop.stopId,
    },
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(stop.lon), parseFloat(stop.lat)],
    }
  };
}

function getLineStrings(routePath) {
  routePath = forceArray(routePath);
  return routePath.map(function (line) {
    var points = forceArray(line.point);
    var geoPath = points.map(function (point) {
      return [parseFloat(point.lon), parseFloat(point.lat)];
    });
    return geoPath;
  });
}

function buildRoute(route) {
  return {
    type: 'Feature',
    properties: {
      title: route.route.title,
      tag: route.route.tag,
      color: route.route.color,
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: getLineStrings(forceArray(route.route.path)),
    }
  };
}

function buildFeaturesShell(copyright) {
  return { type: 'FeatureCollection', features: [], copyright: copyright };
}

module.exports = {
  buildStopPoint: buildStopPoint,
  buildRoute: buildRoute,
  buildFeaturesShell: buildFeaturesShell,
};
