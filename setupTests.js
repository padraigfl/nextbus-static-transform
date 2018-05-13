'use strict';

var module = require('./src/index');
var api = module.api;
var io = require('./utils/jsonIO');
var forceArray = require('./src/utils/forceArray');

function junkData(obj) {
  if(obj) {
    Object.keys(obj).forEach(function(key) {
      var typ = typeof obj[key];
      if(typ === 'object') {
        obj[key] = junkData(obj[key]);
      } else if (typ === 'string') {
        obj[key] = 'abc';
      } else if (typ === 'boolean') {
        obj[key] = true;
      } else if (typ === 'number') {
        obj[key] = 1;
      }
    });
    return obj;
  }
}

api.getAgencies().then(function(data){
  var agency = data.agency[parseInt(data.agency.length * Math.random())];
  console.log('Testing Routes for Agency: '+agency.tag); // eslint-disable-line
  api.getRoutesTags(agency.tag).then(function(data){
    var route = forceArray(data.route);
    var randomRoute = route[parseInt(route.length * Math.random())];
    console.log('Selected route: '+randomRoute.tag); // eslint-disable-line
    api.getRoute(agency.tag, randomRoute.tag).then(function(res){
      var junkRoute = junkData(res);
      io.writeJSON('test/testFile.json', junkRoute);
    });
  });
});
