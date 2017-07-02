(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GA = require('genetic-algorithm-fw');

console.log(GA)
},{"genetic-algorithm-fw":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    var mutationFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (phenotype) {
      return phenotype;
    };
    var crossoverFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (a, b) {
      return [a, b];
    };
    var fitnessFunction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (phenotype) {
      return 0;
    };
    var isABetterThanBFunction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
    var population = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    var populationSize = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 100;
    var chanceOfMutation = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 50;

    _classCallCheck(this, _class);

    this.mutationFunction = mutationFunction;
    this.crossoverFunction = crossoverFunction;
    this.fitnessFunction = fitnessFunction;
    this.isABetterThanBFunction = isABetterThanBFunction;
    this.population = population;
    this.populationSize = populationSize;
    this.chanceOfMutation = chanceOfMutation;
  }

  _createClass(_class, [{
    key: "populate",
    value: function populate() {

      var size = this.population.length;
      while (this.population.length < this.populationSize) {
        this.population.push(this.mutate(this.population[Math.floor(Math.random() * size)]));
      }
    }
  }, {
    key: "mutate",
    value: function mutate(phenotype) {
      return this.mutationFunction(phenotype);
    }
  }, {
    key: "crossover",
    value: function crossover(phenotype) {
      var randomIndex = Math.floor(Math.random() * this.population.length);
      var matePhenotype = this.population[randomIndex];
      return this.crossoverFunction(phenotype, matePhenotype);
    }
  }, {
    key: "isABetterThanB",
    value: function isABetterThanB(a, b) {
      var isABetterThanB = false;
      if (this.isABetterThanBFunction) {
        return this.isABetterThanBFunction(a, b);
      }
      return this.fitnessFunction(a) >= this.fitnessFunction(b);
    }
  }, {
    key: "compete",
    value: function compete() {
      var _this = this;

      var nextGeneration = [];

      for (var p = 0; p < this.population.length - 1; p += 2) {
        var competitorA = this.population[p];
        var competitorB = this.population[p + 1];
        var dominant = this.isABetterThanB(competitorA, competitorB) ? competitorA : competitorB;

        var children = this.crossover(dominant);
        var children = children.map(function (child) {
          if (Math.random() < _this.chanceOfMutation / 100) {
            return _this.mutate(child);
          }
          return child;
        }, this);

        nextGeneration.push.apply(nextGeneration, _toConsumableArray(children));
      }

      this.population = nextGeneration;
    }
  }, {
    key: "mixPopulationOrder",
    value: function mixPopulationOrder() {

      for (var index = 0; index < this.population.length; index++) {
        var newIndex = Math.floor(Math.random() * this.population.length);
        var tempPhenotype = this.population[newIndex];
        this.population[newIndex] = this.population[index];
        this.population[index] = tempPhenotype;
      }
    }
  }, {
    key: "evolve",
    value: function evolve() {
      // Only runs when we do not have enough pehotypes in our population
      this.populate();

      // Mix the phenotypes, so we can iterate through them at random
      this.mixPopulationOrder();

      // Populate the new generation
      this.compete();
    }
  }, {
    key: "best",
    value: function best() {
      var myFitnessFunction = this.fitnessFunction;
      var theBest = this.population.reduce(function (previousPhenotype, currentPhenotype) {
        var previousFitness = myFitnessFunction(previousPhenotype);
        var currentFitness = myFitnessFunction(currentPhenotype);
        return previousFitness >= currentFitness ? previousPhenotype : currentPhenotype;
      });

      return theBest;
    }
  }]);

  return _class;
}();

exports.default = _class;
},{}]},{},[1]);
