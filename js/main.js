toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "8000",
  "extendedTimeOut": "2000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
var CONF = {
  gold_1000: false,
  preTrainedEnnemies: true,
  bigNumbers: true,
  // "easy" | "medium" | "hardcore"
  difficulty: "medium"
}


var GameLogic = function () {
  var self = {}


  self.killEnnemy = function (victim) {
    displayPreparedAlerts("FirstKill")
    var gold = victim.drop.gold

    self.hero.gold += gold;
    self.hero.goldTotal += gold;

    self.ai.spawnEnnemy()

    vueHero.updateGold()
    vueBattle.newEnnemy()
  }
  self.init = function () {
    self.hero = new Hero({
      name: "Jean",
      hp: 100,
    })
    self.ai = new AI()
    Alerts.FirstKill.displayed = false
    gameLogic.hero.implementAllUpgrades()
  }

  return self
}
var BattleEntity = function (o = {}) {
  var self = {}
  self.hp = o.hp || 10
  self.hpMax = o.hp || 10
  self.baseHp = o.hp || 10
  self.attackDamage = o.attackDamage || 1
  self.powerMultiplier = 1
  self.level = 0
  self.drop = o.drop || {
    gold: 1
  }
  self.upgrades = {}
  self.pattern = {}
  self.exportPattern = function () {
    return JSON.stringify(self.pattern)
  }

  self.attack = function (damage, callbackStillAlive) {
    self.attackedTarget = self.getTarget()
    damage = damage || self.getDamage()
    damage = self.getTarget().reduceDamage(damage)
    self.getTarget().resolveDamage(self, damage, callbackStillAlive)
  }
  // return my physical damage
  self.getDamage = function () {
    var damage = self.attackDamageTotal
    if (self.getTarget().critical)
      damage = self.critical.trigger(damage)
    return damage
  }
  self.reduceDamage = function (damage) {
    if (self.defense)
      damage = self.defense.trigger(damage)
    return damage
  }
  self.resolveDamage = function (attacker, damage, callbackStillAlive) {
    self.hp -= damage
    self.hp = Number(self.hp.toFixed(1))
    if (self.hp <= 0) {
      self.die(attacker)
    } else {
      if (typeof callbackStillAlive == "function")
        callbackStillAlive()
    }
    if (attacker.lifeSteal)
      attacker.lifeSteal.trigger(damage)
  }
  self.die = function (attacker) {
    // do something
    console.log("killed")
  }
  self.implementUpgrade = function (upgrade) {
    var me = self
    if (!isArray(upgrade)) {
      console.error("Use an array instead of this : ", upgrade)
      return false
    }
    upgrade.forEach(function (u) {
      u.owner = me
      u.immediateEffect()
      self.upgrades[u.name] = u
    })
  }
  self.implementAllUpgrades = function () {
    var t = []
    for (var u in Upgrades) {
      //      t.push(Upgrades[u])
      t.push(clone(Upgrades[u]))
    }
    self.implementUpgrade(t)
  }
  self.implementPattern = function (pattern) {
    for (var p in pattern) {
      var upgrade = pattern[p]
      for (var i = 0; i < upgrade.level; i++) {
        //        console.log(self)
        //        console.log(p)
        self.upgrades[p].levelUp()
        self.pattern[p] = {
          level: self.upgrades[p].level
        }
      }
    }
  }

  self.calculateAttack = function () {
    self.attackDamageTotal = Number((self.attackDamage * self.powerMultiplier).toFixed(2))
  }
  self.calculateAttack()

  return self
}
var Hero = function (o = {}) {
  var self = BattleEntity(o)
  self.name = o.name || "Anonymous"
  self.gold = CONF.gold_1000 ? 1000 : 0
  self.goldTotal = 0
  self.ennemyKilledAmount = 0
  self.type = "hero"
  self.updateView = true



  self.buyUpgrade = function (title) {
    if (!self.upgrades[title]) {
      toastr["error"]("Upgrade not found")
      return false
    }
    var upgrade = self.upgrades[title]

    tryLoopMechanics(function () {
      if (!self.canAfford(title)) {
        //        toastr["error"]("Can't afford this upgrade")
        return false
      }

      if (upgrade.max && upgrade.level >= upgrade.max) {
        return false
      }
      self.gold -= upgrade.price
      //      console.log(upgrade)
      upgrade.levelUp()

      self.pattern[upgrade.name] = {
        level: self.upgrades[upgrade.name].level
      }

      return true
    })
    if (self.updateView) {
      vueHero.updateGold()
      vueMechanics.updateLists()
    }
    return true
  }
  self.downGrade = function (title) {
    if (!self.upgrades[title]) {
      toastr["error"]("Upgrade not found")
      return false
    }
    var upgrade = self.upgrades[title]
    tryLoopMechanics(function () {

      if (upgrade.level == 0 || upgrade.level == upgrade.min) {
        //toastr["error"]("Level already at minimum")
        return false
      }
      upgrade.levelDown()
      self.pattern[upgrade.name] = {
        level: self.upgrades[upgrade.name].level
      }
      self.gold += upgrade.price
      return true
    })
    if (self.updateView) {
      vueHero.updateGold()
      vueMechanics.updateLists()
    }
    return true
  }
  self.newUpgrade = function (title) {
    if (!self.upgrades[title]) {
      toastr["error"]("Upgrade not found")
      return false
    }
    var upgrade = this.upgrades[title]
    if (!self.canAfford(title)) {
      toastr["error"]("Can't afford this upgrade")
      return false
    }
    upgrade.available = false
    upgrade.bought = true
    upgrade.levelUp()
    self.pattern[upgrade.name] = {
      level: self.upgrades[upgrade.name].level
    }
    self.gold -= upgrade.price

    if (self.updateView) {
      vueHero.updateGold()
      vueMechanics.updateLists()
    }
    return true
  }
  self.canAfford = function (title) {
    return self.gold >= self.upgrades[title].price
  }
  self.notMinimum = function (title) {
    return self.upgrades[title].level > self.upgrades[title].min
  }
  self.isMaxLevel = function (title) {
    if (!self.upgrades[title].max) {
      return true
    }
    return self.upgrades[title].level < self.upgrades[title].max
  }

  self.endTurn = function () {
    if (self.magic.enabled) {
      self.magic.regenerate()
    }

    if (self.attackedTarget == self.getTarget()) {
      self.getTarget().attack()
    }
    self.attackedTarget = undefined
  }

  var super_attack = self.attack
  self.attack = function (damage, cb) {

    // Use attack
    super_attack(damage, cb)

    // Finish turn
    self.endTurn()

    if (self.updateView) {
      vueBattle.updateEnnemyHp()
      vueHero.updateHp()
    }
  }

  var super_resolveDamage = self.resolveDamage
  self.resolveDamage = function (attacker, damage, callbackStillAlive) {

    // Use attack
    super_resolveDamage(attacker, damage, callbackStillAlive)
    self.getTarget().deal(damage)

  }

  self.getTarget = function () {
    return gameLogic.ennemy
  }
  self.getUpgrades = function () {
    var bought = []
    var available = []
    for (var a in self.upgrades) {
      var e = self.upgrades[a]
      if (e.bought) {
        bought.push(e.name)
      } else {
        if (self.checkRequirement(e)) {
          e.available = true
        }
        if (e.available) {
          available.push(e.name)
        }
      }
    }
    return {
      bought: bought,
      available: available,
    }
  }
  self.checkRequirement = function (upgrade) {
    var valid = true
    upgrade.required.forEach(function (e) {
      if (typeof e == "function") {
        if (!e(self.upgrades)) {
          valid = false
        }
      } else if (!self.upgrades[e].bought) {
        valid = false
      }
    })
    return valid
  }

  return self
}
var Ennemy = function (o = {}) {
  var self = BattleEntity(o)
  self.type = "ennemy"
  self.damageDealt = 0
  self.createdAt = new Date().getTime()
  self.name = o.name || randomArrayValue(Ennemy.nameList)
  self.die = function (attacker) {
    // do something
    gameLogic.killEnnemy(self)
  }
  self.getTarget = function () {
    return gameLogic.hero
  }
  self.deal = function (damage) {
    self.damageDealt += damage
  }

  var super_resolveDamage = self.resolveDamage
  self.resolveDamage = function (attacker, damage, callbackStillAlive) {

    // Use attack
    super_resolveDamage(attacker, damage, callbackStillAlive)
    gameLogic.ai.avgHeroDamage(damage)

  }

  return self
}
Ennemy.nameList = ["Critter", "Monster", "Giant", "Wolf", "Insect"]

var Alerts = {
  FirstKill: {
    type: "info",
    message: "<p>Congratulation you killed your first ennemy. <br> Killing ennemies give you gold that you can use in the Mechanic tab to level up your skills.</p>",
  }
}

var Upgrade = function (o = {}) {
  var self = {
    name: o.name || "unnamed",
    displayName: o.displayName || null,
    price: o.price || 1,
    bought: o.bought || false,
    available: o.available || false,
    required: o.required || [],
    level: o.level || 0,
    min: o.min || 0,
    max: o.max || null,
    color: o.color || "",
    desc: o.desc || "An upgrade",
    isHeroUpgrade: o.isHeroUpgrade || false,
  }
  if (o.bought) {
    self.available = false
  }
  self.effect = o.effect || function () {}
  self.immediateEffect = o.immediateEffect || function () {}
  self.levelUp = function () {
    this.level++;
    this.effect()
  }
  self.levelDown = function () {
    this.level--;
    this.effect()
  }
  self.isEnnemyUpgrade = function () {
    return this.owner == "ennemy"
  }

  self.desc = addTitle(self)


  return self
}
var Upgrades = {}
Upgrades.Strenght = new Upgrade({
  name: "Strenght",
  price: 1,
  color: "red-text red-lighten-3",
  bought: true,
  desc: "Increase your damages by 1",
  effect: function () {
    this.owner.attackDamage = this.level + 1
    this.owner.calculateAttack()
    if (!this.isEnnemyUpgrade())
      vueHero.updateAttackDamage()
  },
})
Upgrades.Life = new Upgrade({
  name: "Life",
  price: 2,
  bought: true,
  color: "green-text",
  desc: "Increase your HP by 100",
  effect: function () {
    var o = this.owner
    var amout = o.baseHp * (this.level + 1)
    var modifier = (o.hpMax - amout) < 0 ? 1 : -1
    o.hp = smartRound(o.hp + (o.baseHp * modifier))
    o.hpMax = amout
    if (!this.isEnnemyUpgrade())
      vueHero.updateHp()
  },
})
Upgrades.Power = new Upgrade({
  name: "Power",
  available: true,
  color: "red-text",
  price: 5,
  desc: "Increase your damages by 10%",
  effect: function () {
    this.immediateEffect()
    if (!this.isEnnemyUpgrade())
      vueHero.updateAttackDamage()
  },
  immediateEffect: function () {
    var upgrade = this
    this.price = 4 + powLevel(this.level)
    this.owner.powerMultiplier = 1 + (this.level / 10)
    this.owner.calculateAttack()
  }
})
Upgrades.LifeSteal = new Upgrade({
  name: "LifeSteal",
  displayName: "Life steal",
  available: false,
  required: ["Power"],
  price: 10,
  color: "purple-text",
  desc: "Each hit gives you back life<br>Increase your life steal by 10%",
  effect: function () {
    this.price = 9 + powLevel(this.level)
    this.owner.lifeSteal.efficiency = Number((0.1 * this.level).toFixed(2))
    if (!this.isEnnemyUpgrade())
      vueHero.updateLifeSteal()
  },
  immediateEffect: function () {
    var upgrade = this
    this.price = 9 + powLevel(this.level)
    this.owner.lifeSteal = {
      efficiency: 0.1 * this.level,
      trigger: function (damageAmount) {
        //console.log(self)
        if (upgrade.level == 0) {
          return
        }
        //console.log(damageAmount)
        var o = upgrade.owner
        //console.log("Owner : ", o)
        o.hp += o.lifeSteal.efficiency * damageAmount
        o.hp = o.hp >= o.hpMax ? o.hpMax : parseFloat(o.hp.toFixed(1))

      }
    }
  }
})
Upgrades.Defense = new Upgrade({
  name: "Defense",
  price: 2,
  available: true,
  color: "brown-text",
  desc: "Reduce damage taken by 1",
  effect: function () {
    this.immediateEffect(this)
    this.price = this.level * 2
    if (!this.isEnnemyUpgrade())
      vueHero.updateDefense()
  },
  immediateEffect: function () {
    var o = this.owner
    var upgrade = this
    o.defense = {
      value: upgrade.level,
      trigger: function (damage) {
        damage -= o.defense.value
        damage = damage > 0 ? damage : 0
        return damage
      }
    }
  }
})
Upgrades.AutoAttack = new Upgrade({
  name: "AutoAttack",
  price: 5,
  required: ['Power'],
  max: 5,
  isHeroUpgrade: true,
  desc: "Allow you to attack automatically",
  effect: function () {
    var mod = this.owner.autoAttack
    if (mod.idInterval) {
      clearInterval(mod.idInterval)
      barCooldown.set(1)
    }
    if (this.level == 0) {
      return
    }
    var d = (mod.duration / this.level).toFixed(2)
    barCooldown.animate(0, {
      duration: d,
    })

    mod.idInterval = setInterval(function () {
      vueBattle.attack()
      barCooldown.set(1)
      barCooldown.animate(0, {
        duration: d,
      })
    }, d)
  },
  immediateEffect: function () {
    this.owner.autoAttack = {
      duration: 2000
    }
  }
})
Upgrades.CriticalChance = new Upgrade({
  name: "CriticalChance",
  displayName: "Critical chance",
  desc: "Critical hits deal 2x damages<br>Can be increased by - CriticalDamage -<br>Increase your critical hit chance by 2%",
  color: "red-text text-darken-1",
  effect: function () {
    var o = this.owner
    this.price = this.level + 1
    o.critical.chance = smartRound(0.1 + (0.02 * this.level))
    if (this.level == 0) {
      o.critical.chance = 0
    }
    if (!this.isEnnemyUpgrade())
      vueHero.updateCriticalChance()
  },
  immediateEffect: function () {
    var o = this.owner
    this.price = this.level + 1
    o.critical = {
      chance: 0,
      multiplier: 2,
    }
    o.critical.trigger = function (damage) {
      if (wheel(1 / o.critical.chance)) {
        throwText(damage * o.critical.multiplier)
        return damage * o.critical.multiplier
      }
      return damage
    }
  }
})
Upgrades.CriticalDamage = new Upgrade({
  name: "CriticalDamage",
  displayName: "Critical damage",
  required: ["CriticalChance"],
  price: 3,
  desc: "Increase your critical damages by 10%",
  color: "red-text text-darken-1",
  effect: function () {
    this.price = this.level
    this.owner.critical.multiplier = Number((2 + (this.level * 0.25)).toFixed(2))
    if (!this.isEnnemyUpgrade())
      vueHero.updateCriticalDamage()
  },
})
//====== Magic ======
Upgrades.Magic = new Upgrade({
  name: "Magic",
  price: 2,
  desc: "Unlock powerful magical attacks<br>Increase your mana by 100",
  color: "blue-text text-lighten-2",
  min: 1,
  isHeroUpgrade: true,
  effect: function () {
    var o = this.owner
    var upgrade = this
    if (!o.magic.enabled) {
      o.magic.enabled = true
    } else {

      var amount = smartRound(o.magic.baseMana * this.level)
      var modifier = (o.magic.manaMax - amount) < 0 ? 1 : -1
      o.magic.mana = o.magic.mana + (o.magic.baseMana * modifier)
      o.magic.manaMax = amount
      o.magic.regenerationRate = this.level
    }
    if (!this.isEnnemyUpgrade())
      vueHero.updateMana()
  },
  immediateEffect: function () {
    var o = this.owner
    var upgrade = this
    o.magic = {
      mana: 100,
      manaMax: 100,
      baseMana: 100,
      regenerationRate: 1,
      hasEnoughMana: function () {
        if (o.magic.mana <= o.magic.fireBall.cost) {
          toastr['warning']('Not enough mana')
          return false
        }
        return true
      },
      regenerate: function () {
        o.magic.mana += o.magic.regenerationRate
        if (o.magic.mana > o.magic.manaMax) {
          o.magic.mana = o.magic.manaMax
        }
        if (!upgrade.isEnnemyUpgrade())
          vueHero.updateMana()
      }
    }
  }
})
Upgrades.FireBall = new Upgrade({
  name: "FireBall",
  price: 5,
  desc: "Use a devastating fireball<br>Increase damage dealt by 10",
  color: "blue-text",
  min: 1,
  required: ['Magic'],
  isHeroUpgrade: true,
  effect: function () {
    var o = this.owner
    o.magic.fireBall.cost = smartRound(8 + (this.level * 2))
    o.magic.fireBall.damage = smartRound(10 * this.level)
    if (!this.isEnnemyUpgrade())
      vueBattle.fireBallActive = true
  },
  immediateEffect: function () {
    var o = this.owner
    var upgrade = this
    o.magic.fireBall = {
      cost: 8,
      damage: 10,
      trigger: function () {
        if (!o.magic.hasEnoughMana()) {
          return false
        }
        o.attackedTarget = o.getTarget()
        o.magic.mana -= o.magic.fireBall.cost
        o.getTarget().resolveDamage(o, o.magic.fireBall.damage)
        o.endTurn()
        if (!upgrade.isEnnemyUpgrade()) {
          vueHero.updateMana()
          vueHero.updateHp()
        }
        return true
      }
    }
  }
})
Upgrades.Heal = new Upgrade({
  name: "Heal",
  price: 5,
  desc: "Heal your wounds<br>Increase heal by 10",
  color: "blue-text",
  min: 1,
  required: ['Magic'],
  isHeroUpgrade: true,
  effect: function () {
    var o = this.owner
    o.magic.heal.cost = smartRound(8 + (this.level * 2))
    o.magic.heal.damage = smartRound(10 * this.level)
    if (!this.isEnnemyUpgrade())
      vueBattle.healActive = true
  },
  immediateEffect: function () {
    var o = this.owner
    var upgrade = this
    o.magic.heal = {
      cost: 8,
      damage: 10,
      trigger: function () {
        if (!o.magic.hasEnoughMana()) {
          return false
        }
        o.attackedTarget = o.getTarget()
        o.magic.mana -= o.magic.heal.cost
        o.hp += o.magic.heal.damage
        o.hp = o.hp >= o.hpMax ? o.hpMax : parseFloat(o.hp.toFixed(1))
        o.endTurn()
        if (!upgrade.isEnnemyUpgrade()) {
          vueHero.updateMana()
          vueHero.updateHp()
        }
      }
    }
  }
})
//====== Alternate gameplay ======
Upgrades.AlternateGameplay = new Upgrade({
  name: "AlternateGameplay",
  displayName: "Alt. Gameplay",
  price: 4,
  desc: "Unlock strange alternative gameplay !",
  color: "teal-text",
  min: 1,
  max: 1,
  isHeroUpgrade: true,
})
Upgrades.TypeFighting = new Upgrade({
  name: "TypeFighting",
  displayName: "Word fighting",
  price: 5,
  desc: "Fight using your keyboard<br>Deal 20% more damage per level",
  color: "teal-text text-darken-2",
  required: ['AlternateGameplay'],
  min: 1,
  isHeroUpgrade: true,
  effect: function () {
    var o = this.owner
    this.price = 5 + this.level * 2
    o.typeFighting.multiplier = (this.level * 0.2) + 1
    if (!this.isEnnemyUpgrade())
      vueBattle.typeFightingActive = true
  },
  immediateEffect: function () {
    var o = this.owner
    var upgrade = this
    o.typeFighting = {
      enabled: false,
      multiplier: 2,
      speedMultiplier: 1,
      trigger: function () {
        this.enabled = !this.enabled
        if (this.enabled)
          this.init()
      },
      chooseAWord: function () {
        var index = Math.round(Math.random() * wordList.length)
        return wordList[index]
      },
      newWord: function () {
        var word = this.chooseAWord()
        this.currentWord = {
          word: word,
          wordCut: word,
          index: 0,
          errors: 0,
        }
      },
      newNextWord: function () {
        var word = this.chooseAWord()
        var next = {
          word: word,
          wordCut: word,
          index: 0,
          errors: 0,
        }
        if (this.nextWord) {
          this.currentWord = this.nextWord
        }
        this.nextWord = next
        $('#typeFightingInput').text("")
        $('#typeFightingInput').attr('data-word', this.currentWord.word)
        $('#typeFightingInput').attr('data-next-word', this.nextWord.word)

        // SPEED 
        this.wordStartDate = new Date()
      },
      init: function () {
        this.newWord()
        this.newNextWord()
        var self = this
        $('#typeFightingInput').off('keydown')
        $('#typeFightingInput').keydown(function (e) {
          //          console.log(e.key)
          if (!isLetter(e.key)) {
            return
          }

          if (e.key != self.currentWord.word[self.currentWord.index]) {
            self.currentWord.errors++
              return false
          }
          self.currentWord.index++;
          if (self.currentWord.index == self.currentWord.word.length) {
            if (self.calculateSpeed) {
              self.calculateSpeed()
            }
            self.attack()
            self.newNextWord()
            return false
          } else {
            self.currentWord.wordCut = self.currentWord.wordCut.substr(1)
            $(this).attr('data-word', self.currentWord.wordCut)
          }

        })
      },
      attack: function () {
        var damage = o.getDamage()
        var multi = smartRound((this.speedMultiplier * this.multiplier) - this.currentWord.errors)
        damage *= multi
        damage = smartRound(damage)
        throwText(multi + "x")
        o.attack(damage)
      }
    }

  }
})
Upgrades.TypeFightingSpeed = new Upgrade({
  name: "TypeFightingSpeed",
  displayName: "Fast words",
  price: 10,
  desc: "The faster you type, the harder you hit",
  color: "teal-text text-darken-2",
  required: [function (upgrades) {
    return upgrades.TypeFighting.level >= 5
  }],
  min: 1,
  max: 1,
  isHeroUpgrade: true,
  effect: function () {
    var o = this.owner
    this.price = 0
    o.typeFighting.calculateSpeed = function () {

      var now = new Date()
      // Speed in millisecond
      var speed = now - this.wordStartDate
      /*    
      const wpm = 40 // Average writing speed per minute
      var wps = smartRound(wpm / 60) // Average writing speed per second
      var letterPerSecond = wps * 6 // Average letter speed per second
      var letterPerMillisecond = letterPerSecond / 1000 // Average letter speed per second
      */
      const lpms = 0.004
      const millisecond_per_letter = 250
      var l = this.currentWord.word.length
      var normalSpeed = l * millisecond_per_letter
      var deltaSpeed = normalSpeed - speed
      //      console.log("speed:", speed, " | normal speed:", normalSpeed, " | delta:", deltaSpeed)
      // if delta is > 0, it's faster
      if (deltaSpeed > 0) {
        this.speedMultiplier = 0.5 + smartRound(Math.sqrt(deltaSpeed / 100))
      } else {
        this.speedMultiplier = 1
      }
      //      console.log("speed Multiplier :", o.typeFighting.speedMultiplier)


    }

  }
})

var UpgradesEnnemy = filterObj(Upgrades, function (o) {
  return o.isHeroUpgrade == false
})

var gameLogic = new GameLogic() // Init
gameLogic.init()
var sliderLabel = 1,
  barHp, barCooldown, barMana
$(document).ready(function () {


  var labels = [1, 10, 25, 100, 1000, "Max"]
  $("#range").ionRangeSlider({
    values: labels,
    grid: true,
    postfix: 'x',
    max_postfix: '',
    onFinish: function (data) {
      sliderLabel = data.from_value
    }
  })

  barHp = new ProgressBar.Line('#progressBar', {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#41ea41',
    trailWidth: 0,
    svgStyle: {
      width: '100%',
      height: '100%'
    },
    from: {
      color: '#f44336'
    },
    to: {
      color: '#00e676 '
    },
    step: (state, barHp) => {
      barHp.path.setAttribute('stroke', state.color);
    }
  });
  barHp.animate(1.0); // Number from 0.0 to 1.0
  barMana = new ProgressBar.Line('#progressBarMana', {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#03a9f4',
    trailWidth: 0,
    svgStyle: {
      width: '100%',
      height: '100%'
    }
  });

  barCooldown = new ProgressBar.Line('#btnAttack', {
    strokeWidth: 2,
    easing: 'linear',
    duration: 2000,
    color: '#e8e8e8',
    trailWidth: 0,
    svgStyle: {
      width: '100%',
      height: '3px',
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
  })

  $('.wait-for-DOM').fadeIn()

  $('#mechanics').on('click', '.card-title', function () {
    $(this)
      .find('.fa-stack-1x')
      .toggleClass('fa-compress fa-expand')
    $(this)
      .parent()
      .toggleClass('active')

    $(this)
      .next()
      .slideToggle()
      .next()
      .slideToggle()
      .next()
      .fadeToggle(200)

  })
  $('#reduceAll').click(function () {
    $(this)
      .toggleClass('active')
      .find('.fa-stack-1x')
      .toggleClass('fa-compress fa-expand')
    if (!$(this).hasClass('active')) {
      $('#mechanics .card-content.active .card-title').click()
    } else {
      $('#mechanics .card-content:not(".active") .card-title').click()
    }
  })

  //  advance()

})

function advance() {
  var pattern = JSON.parse('{"Strenght":{"level":6},"Defense":{"level":1}}')
  gameLogic.hero.implementPattern(pattern)
  gameLogic.ai.ennemySpawned = 10
  gameLogic.ai.gold = 10
  vueMechanics.updateAll()
  gameLogic.hero.attack()
  gameLogic.hero.attack()

}
