/* eslint-disable */
/* eslint-env mocha */
'use strict';

var expect = require('chai').expect;
var module = require('../src/index');
var aggregator = module.aggregator;
var geo = module.geo;
var io = require('../src/jsonIO');

var stopAggregators;

var route = io.readJSON('./test/testFile.json');

describe('aggregators', function(){
  var agg = aggregator(route);
  it('builds aggregated route object', function(){
    expect(!!agg.routes).to.equal(true);
  });
  it('builds aggregated stop object', function(){
    stopAggregators = agg.stops;
    expect(!!agg.stops).to.equal(true);
  });
  it('appends to existing route object', function(){
    expect(Object.keys(aggregator(route, {'test': 'blah'}).routes).length).to.equal(2);
  });
});
describe('geoJsons', function(){
  it('builds route geoJson', function(){
    var r = geo.buildRoute(route);
    expect(!!r).to.equal(true);
  });
  it('builds stop geoJson from aggregated stops', function(){
    Object.keys(stopAggregators).forEach(function(stopTag){
      expect(!!geo.buildStopPoint(stopAggregators[stopTag])).to.equal(true);
    });
  });
});
