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

setTimeout(function(){
  describe('routes', function() {
    it('fetches route data successfully', function() {
      expect(!!route).to.equal(true);
    });
    it('contains route attribute', function() {
      expect(!!route.route).to.equal(true);
    });
    it('contains tag attribute', function(){
      expect(!!route.route.tag).to.equal(true);
    });
    it('contains title', function(){
      expect(!!route.route.title).to.equal(true);
    });
    it('contains color attribute', function(){
      expect(!!route.route.color).to.equal(true);
    });
    it('contains alternative color attribute', function(){
      expect(!!route.route.oppositeColor).to.equal(true);
    });
    it('entries in route to have stop data', function(){
      expect(!!route.route.stop).to.equal(true);
      expect(Array.isArray(route.route.stop)).to.equal(true);
      route.route.stop.forEach(function(stop){
        expect(!!stop.tag).to.equal(true);
        expect(!!stop.lat).to.equal(true);
        expect(!!stop.lon).to.equal(true);
        expect(!!stop.title).to.equal(true);
        if(stop.stopId){
          expect(typeof stop.stopId).to.equal('string');
        }
        if(stop.shortTitle){
          expect(typeof stop.shortTitle).to.equal('string');
        }
      });
    });
    it('entries in stop order', function(){
      expect(!!route.route.direction).to.equal(true);
      var directions = route.route.direction;
      if(!Array.isArray(directions)){
        directions = [directions];
      }
      directions.forEach(function(dir){
        dir.stop.map(function(dirStop) {
          expect(!!dirStop.tag).to.equal(true);
        });
      });
    });
    it('entries in path geopoints', function(){
      expect(!!route.route.path).to.equal(true);
      expect(Array.isArray(route.route.path)).to.equal(true);
      route.route.path.forEach(function(path){
        expect(!!path.point).to.equal(true);
        path.point.map(function(point) {
          expect(!!point.lat).to.equal(true);
          expect(!!point.lon).to.equal(true);
        });
      });
    });
  });
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
  run();
}, 2000);
