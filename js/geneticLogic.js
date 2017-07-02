var genetic = Genetic.create()

genetic.optimize = Genetic.Optimize.Maximize;
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.Tournament2;

genetic.seed = function () {
  //  create random ennemy
  var e = gameLogic.ai.generateEnnemy().pattern

  return e
};
genetic.mutate = function () {
  var e = gameLogic.ai.generateEnnemy().pattern
  return e

};
genetic.fitness = function (pattern) {

  var fitness = 0;

  var stop = false
  var e = new Ennemy()
  e.implementAllUpgrades()
  e.implementPattern(pattern)
  var h = gameLogic.ai.generateHero()
  var cpt = 0
  e.die = function (attacker) {
    stop = true
  }
  e.getTarget = function () {
    return h
  }
  h.getTarget = function () {
    return e
  }
  h.updateView = false

  while (cpt < 50 && h.hp > 0 && e.hp > 0 && stop == false) {
    h.attack()
  }
  //  console.log(h)
  //  console.log(pattern )
  fitness = e.damageDealt
  return fitness;
};
genetic.generation = function (pop, gen, stats, isFinished) {
  data.push({
    stats: stats,
    best: pop[0].entity
  })
}
genetic.notification = function (pop, generation, stats, isFinished) {
  var buf = "";
  buf += "<tr>";
  buf += "<td>" + generation + "</td>";
  buf += "<td>" + pop[0].fitness.toPrecision(5) + "</td>";
  buf += "<td>" + JSON.stringify(pop[0].entity) + "</td>";
  buf += "</tr>";
  $("#results tbody").prepend(buf);


}

var config2 = {
  "iterations": 41,
  "size": 25,
  "crossover": 0,
  "mutation": 0.3,
  "skip": 10,
  "webWorkers": false,
};
var data = []
var best_ennemies = []

function go(cnf) {
  var temp = CONF.bigNumbers
  CONF.bigNumbers = false
  data = []
  cnf = cnf || config2
  genetic.evolve(cnf)
  sortBest()
  CONF.bigNumbers = temp  
}

function sortBest() {
  var max = 0
  var best = null
  data.forEach(function (d) {
    var currentStat = d.stats.mean
    if (currentStat > max) {
      max = currentStat
      best = JSON.stringify(d.best)
    }

  })
  best_ennemies.push(best)
}
