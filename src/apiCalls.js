'use strict';

var api = require('./apiFetch');
var writeJSON = require('./jsonIO.js').writeJSON;
var dir = 'src/output';

function getRoute(agency, routeTag) {
  api.getRoute('sf-muni', routeTag)
    .then( function(data) {
      writeJSON(dir+'/route--'+routeTag+'.json', data);
    })
    .catch( function(err) {
      console.log(err); // eslint-disable-line
    } );
}

function getRouteSchedule(agency, routeTag) {
  api.getRouteSchedule('sf-muni', routeTag)
    .then( function(data) {
      writeJSON(dir+'/schedule--'+routeTag+'.json', data);
    })
    .catch( function(err) {
      console.log(err); // eslint-disable-line
    });
}

api.getRoutesTags('sf-muni')
  .then(function(data) {
    data.route.map(function(route, i) {
      console.log(route.tag); // eslint-disable-line
      setTimeout(function() {
        getRoute('sf-muni', route.tag);
        getRouteSchedule('sf-muni', route.tag);
      }, i*2000);
    });
  });
