var assert = chai.assert
var preTrainedEnnemies = true

var AI = function () {
  var self = {
    ennemySpawned: 0,
    gold: 0,
    heroDamages: [],
  }

  self.updateTreshold = function () {
    var map = {
      "easy":2,
      "medium":1.5,
      "hardcore":1,
    }
    self.ennemySpawned++;
    self.gold = ~~(self.ennemySpawned / map[CONF.difficulty])
  }
  self.generateHero = function () {
    var h = new Hero({
      name: "dummy",
      hp: gameLogic.hero.baseHp
    })
    h.implementAllUpgrades()
    var pattern = gameLogic.hero.pattern
    h.implementPattern(pattern)
    return h
  }
  self.generateEnnemy = function () {
    var e = new Ennemy()
    e.implementAllUpgrades()
    e.drop = {
      gold: ~~(Math.sqrt(self.goldPotential)) + 1
    }
    e = self.increaseRandomly(e)
    return e
  }
  self.computePatternValue = function (pattern) {
    var e = new Ennemy()
    e.implementAllUpgrades()
    var gold = 0
    for (var p in pattern) {
      var number = pattern[p]
      for (var i = 0; i < number.level; i++) {
        gold += e.upgrades[p].price
        e.upgrades[p].levelUp()
      }
    }
    return gold
  }
  self.spawnEnnemy = function () {
    if (self.ennemyPrototype) {
      self.patternEfficiency.push({
        pattern: self.ennemyPrototype.pattern || {},
        efficiency: self.ennemyPrototype.damageDealt || 0,
        level: self.ennemySpawned
      })
    }
    self.ennemyPrototype = null
    if (CONF.preTrainedEnnemies) {
      var e = self.loadPreTrainedEnnemy()
    } else {
      var e = self.generateEnnemy()
    }
    gameLogic.ennemy = e
    self.ennemyPrototype = e
    // update for the next ones
    self.updateTreshold()
  }
  self.increaseRandomly = function (e, g) {
    var gold = g || self.gold
    //    var cpt = 0
    while (gold > 0) {
      if (gold <= 0) return
      var u = pickRandomProperty(UpgradesEnnemy)
      u = e.upgrades[u]
      if (!u.isHeroUpgrade) {
        if (gold >= u.price) {
          gold -= u.price
          u.levelUp()
          e.pattern[u.name] = {
            level: e.upgrades[u.name].level
          }
        }
      }
    }
    assert.equal(gold, 0)
    //    console.log(cpt)
    return e
  }
  self.loadPreTrainedEnnemy = function () {
    // First find a level where there is an ennemy
    // Search from the current gold, in descending order
    var found = false
    var cpt = 0
    var i = self.gold
    while (!found && cpt < 50 && i > 0) {
      cpt++
      if (data_ennemies.hasOwnProperty(String(i))) {
        found = true
      } else {
        i--
      }
    }
    console.log(i)

    // It's the beginning, create a random ennemy
    if (i == 0) {
      return self.generateEnnemy()
    } else {
      var pattern = randomArrayValue(data_ennemies[i])
      console.log(pattern)
      var e = new Ennemy()
      e.implementAllUpgrades()
      e.drop = {
        gold: ~~(Math.sqrt(self.ennemySpawned)) + 1
      }
      e.implementPattern(pattern)
      if (i < self.gold) {
        var f = self.increaseRandomly(e, self.gold - i)
        if (self.computePatternValue(f.pattern) != self.gold) {
          return e
        } else {
          return f
        }
      }
      return e

    }

  }

  // getter of the hero
  self.getHero = function () {
    return gameLogic.hero
  }
  self.avgHeroDamage = function (damage) {
    self.heroDamages.push(damage)
    if (self.heroDamages.length > 10) {
      self.heroDamages.shift()
    }
    self.computeDamages()
  }
  self.computeDamages = function () {
    self.avgDamages = smartRound(self.heroDamages.reduce(function (before, now) {
      return before + now
    }) / self.heroDamages.length)
  }

  self.patternEfficiency = []
  self.spawnEnnemy()
  return self
}


function pickRandomProperty(obj) {
  var result;
  var count = 0;
  for (var prop in obj)
    if (Math.random() < 1 / ++count)
      result = prop;
  return result;
}
