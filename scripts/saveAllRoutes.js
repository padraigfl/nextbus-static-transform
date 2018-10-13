const nextBusTools = require('../src/index');
const forceArray = require('../src/utils/forceArray');
const writeJSON = require('../utils/jsonIO').writeJSON;
const createDirectory = require('../utils/jsonIO').createDirectory;
const aggregateData = nextBusTools.aggregator;
const api = nextBusTools.api;
const geo = nextBusTools.geo;

const dir = './routes';

const getRouteData = (agencyTag, routeTag) => (
  api.getRoute(agencyTag, routeTag)
    .then( route => route)
)

const getAgencyRouteTags = agencyTag => (
  api.getRoutesTags( agencyTag )
    .then(({ route: routes}) => (
      forceArray(routes).map(({ tag }) => tag)
    ))
);

const getAgencyTags = () => (
  api.getAgencies()
    .then(({ agency }) => (
      agency.map(({ tag }) => tag)
    ))
);

const buildGeoRoutes = (routes) => {
  const geoObj = geo.buildFeaturesShell(routes.copyright);
  const routePaths = { type: 'FeatureCollection', features: [] };
  routes.forEach((route) => {
    geoObj.features.push(geo.buildRoute(route, routePaths));
  });
  return geoObj;
}

const buildGeoStops = (stops) => {
  const geoObj = geo.buildFeaturesShell(stops.copyright)
  geoObj.features = Object.keys(stops.data).map(stopKey => (
    geo.buildStopPoint(stops.data[stopKey])
  ));
  return geoObj;
}

const processAgencyRoutes = async (agencyTag) => {
  createDirectory(`${dir}`)
  createDirectory(`${dir}/${agencyTag}`)
  const routeTags = await getAgencyRouteTags(agencyTag);

  const routes = await Promise.all(routeTags.map(async (routeTag, idx) => {
    const route = await getRouteData(agencyTag, routeTag);

    if (routeTags.length - 1 === idx) {
      console.log(`FINISHED: ${agencyTag}`);
    }
    return route;
  }));

  let minifiedData = routes.reduce((acc, route) => (
    aggregateData(route, acc.routes, acc.stops)
  ), { });

  const schedules = await Promise.all(routeTags.map((rTag) =>
    api.getRouteSchedule(agencyTag, rTag)
      .then(data => {
        minifiedData = aggregateData.addScheduleData(rTag, data, minifiedData.routes, minifiedData.stops);
      })
  ));

  writeJSON(`${dir}/${agencyTag}/stops.json`, minifiedData.stops);
  writeJSON(`${dir}/${agencyTag}/routes.json`, minifiedData.routes);
  writeJSON(`${dir}/${agencyTag}/routesMap.geojson`, buildGeoRoutes(routes));
  writeJSON(`${dir}/${agencyTag}/stopsMap.geojson`, buildGeoStops(minifiedData.stops));
};

const getAllRoutes = async () => {
  createDirectory(dir);
  const agencyTags = await getAgencyTags();
  agencyTags.map((tag, idx) => (
    setTimeout(() => processAgencyRoutes(tag), 20000 * idx)
  ));
}

getAllRoutes();
// processAgencyRoutes('jtafla');
