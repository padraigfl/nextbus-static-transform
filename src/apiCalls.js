'use strict';

/* This operation can be called directly, not dependencies */

var axios = require("axios");
var sleep = require("sleep");

var writeJSON = require("./jsonIO.js").writeJSON;

var agent = "sf-muni";
var dir = 'output'
var schedule = false;
var routes = false;

try {
  agency = process.argv[2];
} catch (err) {
  console.log("No agency selected, using sf-muni as default");
}
try {
  if (process.argv[3] === "schedule") schedule = true;
  else if (process.argv[3] === "routes") routes = true;
} catch (err) {
  console.log(`you have selected to not save any data, to save run:
  node [dir]/apiCalls.js (service) (schedule|routes)`);
}

var API_URL = `http://webservices.nextbus.com/service/publicJSONFeed?a=${agency}`;

function getExpandedRoute (route) {
  axios.get(API_URL, { params: { command: "routeConfig", r: route } })
    .then( function(response) {
      writeJSON(`${dir}/route--${route}.json`, response.data);
      console.log(response.data);
    })
    .catch( function(err) { console.log(err); } );
};

function getRouteSchedules(route) {
  axios.get(API_URL, { params: { command: "schedule", r: route } })
    .then( function (response) {
      writeJSON(`${dir}/schedule--${route}.json`, response.data);
    })
    .catch( function(err) { console.log(err); });
};

function getRoutes(agency, expanded, schedule, dir) {
  if (!dir) {
    dir = '.';
  }
  var result;
  result = axios.get(API_URL, { params: { command: "routeList" } })
    .then( function(response) {
      var counter = 1;
      response.data.route.map( function(x) {
        var tag = x.tag;
        console.log(
          `Processing ${counter} of ${response.data.route.length}: ${tag}`
        );
        if (expanded) {
          sleep.sleep(1);
          getExpandedRoute(tag);
        } else if (schedule) {
          sleep.sleep(2);
          getSchedules(tag);
        }
        counter += 1;
      });
      writeJSON(`${dir}/routes-_index.json`, response.data);
    })
    .catch(err => {
      console.log("========ERROR======");
      console.log(err);
    });
  return result;
};

getRoutes(agent, routes, schedule, dir);
