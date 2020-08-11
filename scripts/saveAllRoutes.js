const process = require('process')
const nextBusTools = require('../src/index');
const forceArray = require('../src/utils/forceArray');
const writeJSON = require('../utils/jsonIO').writeJSON;
const createDirectory = require('../utils/jsonIO').createDirectory;
const aggregateData = nextBusTools.aggregator;
const api = nextBusTools.api;
const geo = nextBusTools.geo;

const dir = './routes';

const fails = [];

const routeIssues = [];

const getRouteData = (agencyTag, routeTag) =>
  api.getRoute(agencyTag, routeTag).then(route => route);

const getAgencyRouteTags = agencyTag =>
  api
    .getRoutesTags(agencyTag)
    .then(({ route: routes = [] }) => forceArray(routes).map(({ tag }) => tag));

const getAgencyTags = () =>
  api.getAgencies().then(({ agency }) => agency.map(({ tag }) => tag));

const buildGeoRoutes = routes => {
  const geoObj = geo.buildFeaturesShell(routes.copyright);
  const routePaths = { type: 'FeatureCollection', features: [] };
  routes.forEach(route => {
    geoObj.features.push(geo.buildRoute(route, routePaths));
  });
  return geoObj;
};

const buildGeoStops = stops => {
  const geoObj = geo.buildFeaturesShell(stops.copyright);
  geoObj.features = Object.keys(stops.data).map(stopKey =>
    geo.buildStopPoint(stops.data[stopKey])
  );
  return geoObj;
};

const processAgencyRoutes = async agencyTag => {
  createDirectory(`${dir}`);
  createDirectory(`${dir}/${agencyTag}`);
  const routeTags = await getAgencyRouteTags(agencyTag);

  let routes = [];

  if (routeTags.length > 200) {
    for(let j = 0; j < routeTags.length; j++) {
      const time = new Date().getTime();
      const route = await getRouteData(agencyTag, routeTags[j]);
      routes.push(route);
    }
  } else if (routeTags.length > 0) {
    routes = await Promise.all(
      routeTags.map(async (routeTag, idx) => {
        const route = await getRouteData(agencyTag, routeTag);

        if (routeTags.length - 1 === idx) {
          console.log(`Starting route req: ${agencyTag}`);
        }
        return route;
      })
    );
  } else {
    console.log('No routes for:', agencyTag);
    return;
  }

  let minifiedData = routes.reduce(
    (acc, route) => aggregateData(route, acc.routes, acc.stops),
    {}
  );

  for (let i = 0; i < routeTags.length; i++) {
    const time = new Date().getTime();
    const desc = routeTags.length + ',' + agencyTag + ',' + routeTags[i];
    let x;
    while (time + 200 > new Date().getTime()) {}
    console.log('req:' + i + '/' + desc);
    const sched = await api
      .getRouteSchedule(agencyTag, routeTags[i])
      .then((data) => {
        console.log('res:' + i.toString().padStart(3, ' ') + '/' + desc);
        x = aggregateData.addScheduleData(
          routeTags[i],
          data,
          minifiedData.routes,
          minifiedData.stops
        );
      })
      .catch(e => {
        console.log(e);
        console.log('fail' + i.toString().padStart(3, ' ') + '/' + desc );
        routeIssues.push(`${agencyTag}-${routeTags[i]}`);
      });
    if (x) {
      minifiedData = x;
    }
  }

  writeJSON(`${dir}/${agencyTag}/stops.json`, minifiedData.stops);
  writeJSON(`${dir}/${agencyTag}/routes.json`, minifiedData.routes);
  writeJSON(`${dir}/${agencyTag}/routesMap.geojson`, buildGeoRoutes(routes));
  writeJSON(
    `${dir}/${agencyTag}/stopsMap.geojson`,
    buildGeoStops(minifiedData.stops)
  );
  console.log(new Set(fails));
  console.log(new Set(routeIssues));
  console.log(new Set(routeIssues).size);
  console.log('success?');
  return;
};

const getAllRoutes = async () => {
  createDirectory(dir);
  const agencyTags = await getAgencyTags();
  for (let i = 0; i < agencyTags.length; i++) {
    await processAgencyRoutes(agencyTags[i]);
  }
  // need to timeout end to allow writing of files to complete
  setTimeout(process.exit, 1000);
};

getAllRoutes();
