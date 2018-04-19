/* eslint-disable */
var build = require('../src/index');
var api = build.api;
var geo = build.geo;
var minifyRoutes = build.aggregator;

var io = require('./jsonIO');
var writeJSON = io.writeJSON;
var readJSON = io.readJSON;

var dir = 'src/output'; // running from root of project

// STEP 1 Functions: API calls, collecting data

const getRoute = (agency, routeTag) => {
  api.getRoute('sf-muni', routeTag)
    .then( (data) => {
      writeJSON(dir+'/routeData/'+routeTag+'.json', data);
    })
    .catch( (err) => {
      console.log(err); // eslint-disable-line
    } );
}

const getRouteSchedule = (agency, routeTag) => {
  console.log('schedule')
  api.getRouteSchedule('sf-muni', routeTag)
    .then( (data) => {
      writeJSON(dir+'/schedules/'+routeTag+'.json', data);
    })
    .catch( err => {
      console.log(err); // eslint-disable-line
    });
}

const exampleGetRoute = () => (
  api.getRoutesTags('sf-muni').then(data => {
    writeJSON(dir+'/routeData/index.json', data);
    data.route.map((route, i) => {
      console.log(route.tag); // eslint-disable-line
      setTimeout(() => {
        getRoute('sf-muni', route.tag);
        getRouteSchedule('sf-muni', route.tag);
      }, i*2000);
    });
  })
);

// STEP 2 Functions: aggregating data to important parts

const getAggregateData = async () => {
  await exampleGetRoute();
  const routeDataDir = dir + '/routeData';
  const aggregatedDir = dir + '/aggregatedData';
  const routesJson = readJSON(routeDataDir+'/index.json');
  const rTags = routesJson.route.map(route => route.tags);
  const results = rTags.reduce((acc, tag) => {
    console.log(tag);
    const routeJson = readJSON(routeDataDir+'/'+tag+'.json', 'utf8');//todo, export logic
    return minifyRoutes(routeJson, acc.routes, acc.stops);
  }, { stops: {}, routes: {}});
  writeJSON(aggregatedDir+'/stops.json', results.stops);
  writeJSON(aggregatedDir+'/routes.json', results.routes);
}


// STEP 3 Functions: building geojsons

const buildGeoRoutes = (routes, geoObj) => {
  if (!geoObj) {
    geoObj = { type: 'FeatureCollection', features: [] };
  }
  const routePaths = { type: 'FeatureCollection', features: [] };
  routes.forEach((route) => {
    // TODO: replace with API req
    const routeJson = readJSON(dir+'/routeData/'+route+'.json');
    geoObj.features.push(geo.buildRoute(routeJson, routePaths));
  });
  return geoObj;
}

const buildGeoJsons = async () => {
  getAggregateData();
  let aggregatedStops = readJSON(dir+'/aggregatedData/stops.json');
  const routesJson = readJSON(dir+'/routeData/index.json');
  writeJSON(dir+'/geoJSONS/routes.json', buildGeoRoutes(
    routesJson.route.map( route => route.tag )
  ));
  writeJSON(
    dir+'/geoJSONS/stops.json',
    geo.buildFeaturesShell().features.push(
      Object.keys(aggregatedStops).map(stopKey => (
        geo.buildStopPoint(aggregatedStops[stopKey])
      )),
    ),
  );
}

buildGeoJsons();
