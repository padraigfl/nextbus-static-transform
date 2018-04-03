'use strict';

var api = require('./apiFetch');
var geo = require('./buildGeoJsons');
var minifyRoutes = require('./buildAggregatedData');
var io = require('./jsonIO');
var writeJSON = io.writeJSON;
var readJSON = io.readJSON;
var dir = 'src/outputs';

function getRoute(agency, routeTag) {
  api.getRoute('sf-muni', routeTag)
    .then( function(data) {
      writeJSON(dir+'/routeData/'+routeTag+'.json', data);
    })
    .catch( function(err) {
      console.log(err); // eslint-disable-line
    } );
}

function getRouteSchedule(agency, routeTag) {
  console.log('schedule')
  api.getRouteSchedule('sf-muni', routeTag)
    .then( function(data) {
      writeJSON(dir+'/schedules/'+routeTag+'.json', data);
    })
    .catch( function(err) {
      console.log(err); // eslint-disable-line
    });
}

/* Step 1: get files */
api.getRoutesTags('sf-muni')
  .then(function(data) {
    writeJSON(dir+'/routeData/index.json', data);
    data.route.map(function(route, i) {
      console.log(route.tag); // eslint-disable-line
      setTimeout(function() {
        getRoute('sf-muni', route.tag);
        getRouteSchedule('sf-muni', route.tag);
      }, i*2000);
    });
  });


/* Step 2: Aggregate data */
// var routeDataDir = dir + '/routeData';
// var aggregatedDir = dir + '/aggregatedData';
// var routesJson = readJSON(routeDataDir+'/index.json');
// var rTags = routesJson.route.map(function(route) { return route.tags; });
// var results = rTags.reduce(function(acc, tag) {
//   console.log(tag);
//   var routeJson = readJSON(routeDataDir+'/'+tag+'.json', 'utf8');//todo, export logic
//   return minifyRoutes(routeJson, acc.routes, acc.stops);
// }, { stops: {}, routes: {}});
// writeJSON(aggregatedDir+'/stops.json', results.stops);
// writeJSON(aggregatedDir+'/routes.json', results.routes);


/* Step 3: build geojsons */
// var aggregatedStops = readJSON(dir+'/aggregatedData/stops.json');
// var routesJson = readJSON(dir+'/routeData/index.json');
// function buildGeoRoutes(routes, geoObj) {
//   if (!geoObj) {
//     geoObj = { type: 'FeatureCollection', features: [] };
//   }
//   var routePaths = { type: 'FeatureCollection', features: [] };
//   routes.forEach(function(route) {
//     // TODO: replace with API req
//     var routeJson = readJSON(dir+'/routeData/'+route+'.json');
//     geoObj.features.push(geo.buildRoute(routeJson, routePaths));
//   });
//   return geoObj;
// }
// writeJSON(dir+'/geoJSONS/routes.json', buildGeoRoutes(
//   routesJson.route.map(
//     function (route) {
//       return route.tag;
//     }
//   )
// ));
// writeJSON(
//   dir+'/geoJSONS/stops.json',
//   geo.buildFeaturesShell().features.push(
//     Object.keys(aggregatedStops).map(function(stopKey) {
//       return geo.buildStopPoint(aggregatedStops[stopKey]);
//     })
//   ),
// );

