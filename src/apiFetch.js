var fetch = require('node-fetch');

function apiReq(attrs, onFetched) {
  var keys =  Object.keys(attrs);
  var queryString = keys.reduce(function(acc, key) {
    return acc+key+'='+attrs[key]+'&';
  }, '?');

  var request = fetch('http://webservices.nextbus.com/service/publicJSONFeed'+queryString)
    .then(function(res) {
      return res.json();
    });

  if (!onFetched) {
    return request;
  } else {
    request.then(onFetched);
  }
}

function getRoutesTags(agency, onFetched) {
  return apiReq({ a: agency, command: 'routeList' }, onFetched);
}

function getRoute(agency, route, onFetched) {
  return apiReq({ a: agency, command: 'routeConfig', r: route }, onFetched);
}

function getRouteSchedule(agency, route, onFetched) {
  return apiReq({ a: agency, command: 'schedule', r: route }, onFetched);
}

function getAgencies(onFetched) {
  return apiReq({ command: 'agencyList' }, onFetched);
}

module.exports = {
  getRoutesTags: getRoutesTags,
  getRoute: getRoute,
  getRouteSchedule: getRouteSchedule,
  getAgencies: getAgencies,
};
