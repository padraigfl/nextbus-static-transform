/* eslint-disable */
/* eslint-env mocha */
'use strict';

var expect = require('chai').expect;
var module = require('../src/index');
var aggregator = module.aggregator;
var geo = module.geo;
var io = require('../utils/jsonIO');
var forceArray = require('../src/utils/forceArray');

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
  it('throws error when passed other format structure', function(){
    expect(function(){ aggregator({}) }).to.throw(TypeError);
  })
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
  it('builds empty features collection ', function(){
    expect(geo.buildFeaturesShell()).to.deep.equal({ type: 'FeatureCollection', features: [] });
  });
});
describe('utils', function(){
  it('forceArray converts object into array', function(){
    var arr = forceArray({});
    expect(Array.isArray(arr)).to.equal(true);
  });
  it('forceArray returns array untouched if array', function(){
    var particularArray = [ '12' ];
    var arr = forceArray(particularArray);
    expect(arr).to.equal(particularArray);
  });
});
