var http = require('http');

function apiReq(attrs) {
  var keys =  Object.keys(attrs);
  var queryString = keys.reduce(function(acc, key) {
    return '&'+key+'='+attrs[key];
  }, '?'+keys[0]+'='+attrs[keys]);

  return http.get('http://webservices.nextbus.com/service/publicJSONFeed'+queryString, function (resp) {
    var data = '';
    resp.on('data', function (buf) {
      data += buf;
    });
    resp.on('end', function () {
      return data;
    });
  }).on('error', function (err) {
    console.error('Error: ' + err.message); // eslint-disable-line
  });
}

function getRoutesTags(agency) {
  return apiReq({a: agency});
}

function getRoute(agency, route) {
  return apiReq({ a: agency, command: 'routeConfig', r: route });
}

function getRouteSchedule(agency, route) {
  return apiReq({ a: agency, command: 'schedule', r: route });
}

module.exports = {
  getRouteTags: getRoutesTags,
  getRoute: getRoute,
  getRouteSchedule: getRouteSchedule,
};
