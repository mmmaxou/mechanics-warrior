var vueHero = new Vue({
  el: '#hero',
  data: {
    heroName: gameLogic.hero.name,
    heroHp: gameLogic.hero.hp,
    heroHpMax: gameLogic.hero.hpMax,
    heroAttackDamage: gameLogic.hero.attackDamageTotal,
    heroDefense: gameLogic.hero.defense.value,
    heroCriticalChance: gameLogic.hero.critical.chance,
    heroCriticalDamage: gameLogic.hero.critical.multiplier,
    heroLifeSteal: gameLogic.hero.lifeSteal.efficiency,
    heroMana: 0,
    heroManaMax: 0,
    magicHeal: 8,
    magicFireball: 8,
    gold: gameLogic.hero.gold,
  },
  methods: {
    updateGold: function () {
      this.gold = gameLogic.hero.gold
      vueMechanics.updatePrice()
      //      this.goldTotal = gameLogic.hero.goldTotal
    },
    updateAttackDamage: function () {
      this.heroAttackDamage = gameLogic.hero.attackDamageTotal
    },
    updateHp: function () {
      this.heroHp = gameLogic.hero.hp
      this.heroHpMax = gameLogic.hero.hpMax
      barHp.animate((this.heroHp / this.heroHpMax).toFixed(2), {
        duration: 200
      })
    },
    updateDefense: function () {
      this.heroDefense = gameLogic.hero.defense.value
    },
    updateCriticalChance: function () {
      this.heroCriticalChance = gameLogic.hero.critical.chance
    },
    updateCriticalDamage: function () {
      this.heroCriticalDamage = gameLogic.hero.critical.multiplier
    },
    updateLifeSteal: function () {
      this.heroLifeSteal = gameLogic.hero.lifeSteal.efficiency
    },
    updateMana: function () {
      this.heroMana = gameLogic.hero.magic.mana
      this.heroManaMax = gameLogic.hero.magic.manaMax
      barMana.animate((this.heroMana / this.heroManaMax).toFixed(2), {
        duration: 400
      })
    }
  },
  filters: {
    percent: function (value) {
      if (!value) return ''
      return (Math.round(value * 1000) / 10) + "%"
    }
  }
})
var vueBattle = new Vue({
  el: '#battle',
  data: {
    ennemyName: gameLogic.ennemy.name,
    ennemyHp: gameLogic.ennemy.hp,
    ennemyAlive: true,
    ennemyCapacities: "",
    fireBallActive: false,
    healActive: false,
    typeFightingActive: false,
    typeFightingEnabled: false,
  },
  methods: {
    attack: function () {
      gameLogic.hero.attack()
    },
    fireBall: function () {
      gameLogic.hero.magic.fireBall.trigger(gameLogic.ennemy)
      this.updateEnnemyHp()
    },
    heal: function () {
      gameLogic.hero.magic.heal.trigger()
    },
    disableAlternate: function () {
      this.typeFightingEnabled = false
    },
    typeFighting: function () {
      gameLogic.hero.typeFighting.trigger()
      if ( this.typeFightingEnabled ) {
        this.typeFightingEnabled = false        
      } else {
        this.disableAlternate()
        this.typeFightingEnabled = true        
      }
    },
    updateEnnemyHp: function () {
      if (gameLogic.ennemy) {
        this.ennemyHp = gameLogic.ennemy.hp || 0
      } else {
        this.ennemyAlive = false
      }
    },
    newEnnemy: function () {
      this.ennemyName = gameLogic.ennemy.name
      this.ennemyHp = gameLogic.ennemy.hp
      this.ennemyLevel = gameLogic.ennemyLevel
      var t = []
      for (var c in gameLogic.ennemy.pattern) {
        t.push(c)
      }
      this.ennemyCapacities = t.join(" / ")
    },

  },
})

var Mechanic = {
  template: `
<div class="col s12 m6 l4 xl3">
<div class="card tooltipped" :class="{'z-depth-4': initialType === 'bought'}" data-position="top" data-html="true" data-delay="50" :data-tooltip="desc">

<div class="card-content">
  <div class="card-title" :class="color">
    <span class="title truncate">{{ displayName || title }}</span>
    <span class="reduce black-text fa-stack fa-lg">
      <i class="fa fa-square fa-stack-2x"></i>
      <i class="fa fa-compress fa-stack-1x fa-inverse"></i>
    </span>
  </div>

  <p>Price<span class="badge">{{price}}</span></p>
  <p>Level<span class="badge" :class="{new: type != 'bought'}" :data-badge-caption="caption"><span class="level">{{level}}</span></span></p>

<div class="card-action">
  <span class="badge" v-if="type == 'bought'">
    <a><i class="fa fa-plus-circle fa-lg" v-on:click="buyUpgrade" v-if="canAfford && levelMax"></i></a>
    <a><i class="fa fa-minus-circle fa-lg" v-on:click="downGrade" v-if="notMinimum"></i></a>
  </span>
  <span class="badge" v-else>
    <a><i class="fa fa-plus-circle fa-lg" v-on:click="newUpgrade" v-if="canAfford"></i></a>
  </span>
</div>

</div>
</div>
</div>`,
  props: ['title', 'initialType', 'caption'],
  data: function () {
    return {
      type: this.initialType,
      displayName: gameLogic.hero.upgrades[this.title].displayName,
      desc: gameLogic.hero.upgrades[this.title].desc,
      price: gameLogic.hero.upgrades[this.title].price,
      color: gameLogic.hero.upgrades[this.title].color,
      level: gameLogic.hero.upgrades[this.title].level,
      canAfford: gameLogic.hero.canAfford(this.title),
      notMinimum: gameLogic.hero.notMinimum(this.title),
      levelMax: gameLogic.hero.isMaxLevel(this.title),
    }
  },
  methods: {
    "buyUpgrade": function () {
      if (gameLogic.hero.buyUpgrade(this.title)) {
        this.level = gameLogic.hero.upgrades[this.title].level
        this.updatePrice()
        this.updateLevelMax()
        this.updateNotMinimum()
      }
    },
    "downGrade": function () {
      if (gameLogic.hero.downGrade(this.title)) {
        this.level = gameLogic.hero.upgrades[this.title].level
        this.updatePrice()
        this.updateLevelMax()
        this.updateNotMinimum()
      }
    },
    "newUpgrade": function () {
      if (gameLogic.hero.newUpgrade(this.title)) {
        this.type = "bought"
        this.level = 1
        this.updatePrice()
        this.updateLevelMax()
        this.updateNotMinimum()
      }
    },
    "updatePrice": function () {
      this.price = gameLogic.hero.upgrades[this.title].price
    },
    "updateCanAfford": function () {
      this.canAfford = gameLogic.hero.canAfford(this.title)
    },
    "updateNotMinimum": function () {
      this.notMinimum = gameLogic.hero.notMinimum(this.title)
    },
    "updateLevelMax": function () {
      this.levelMax = gameLogic.hero.isMaxLevel(this.title)
    },
  },
}
var vueMechanics = new Vue({
  el: "#mechanics",
  data: {
    mechanicsBought: [],
    mechanicsAvailable: [],
  },
  components: {
    "mechanic": Mechanic
  },
  created: function () {
    this.updateLists()
  },
  methods: {
    "updateLists": function () {
      var data = gameLogic.hero.getUpgrades()

      this.mechanicsBought = data.bought
      this.mechanicsAvailable = data.available

    },
    "updatePrice": function () {
      this.$children[0].$children.forEach(function (c) {
        c.updateCanAfford()
        c.updateNotMinimum()
      })
    },
    "updateAll": function() {
      this.updateLists()
      this.$children[0].$children.forEach(function (c) {
        c.level = gameLogic.hero.upgrades[c.title].level
        c.updatePrice()
        c.updateCanAfford()
        c.updateNotMinimum()
        c.updateLevelMax()
      })
    }
  },
  updated: function () {
    $('.tooltipped').tooltip({});

  }
})
