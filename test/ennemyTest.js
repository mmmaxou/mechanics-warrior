var assert = chai.assert
var expect = chai.expect
chai.config.includeStack = true;
describe('Pattern', function () {
  var createPattern = gameLogic.ai.createPattern
  var computePatternValue = gameLogic.ai.computePatternValue
  var increaseRandomly = gameLogic.ai.increaseRandomly
  var implementPattern = gameLogic.hero.implementPattern
  describe('computePatternValue()', function () {
    it('should return a number', function () {
      var pattern = {
        Strenght: {
          level: 1
        }
      }
      var n = computePatternValue(pattern)
      assert.isNumber(n, 'n is a number')

    })
    var tests = [
      {
        arg: {
          Strenght: {
            level: 1
          }
        },
        expected: 1
      },
      {
        arg: {
          Strenght: {
            level: 3
          }
        },
        expected: 3
      },
      {
        arg: {
          Strenght: {
            level: 5
          }
        },
        expected: 5
      },
      {
        arg: {
          Strenght: {
            level: 25
          }
        },
        expected: 25
      },
      {
        arg: {
          Strenght: {
            level: 2
          },
          Power: {
            level: 1
          }
        },
        expected: 7
      },
      {
        arg: {
          Strenght: {
            level: 2
          },
          Power: {
            level: 3
          }
        },
        expected: 17
      },
      {
        arg: {
          Defense: {
            level: 4
          }
        },
        expected: 14
      },
      {
        arg: {
          Defense: {
            level: 1
          }
        },
        expected: 2
      },
      {
        arg: {
          Power: {
            level: 10
          }
        },
        expected: 57
      },
  ];

    tests.forEach(function (test) {
      it('correctly computes' + JSON.stringify(test.arg) + ' to be ' + test.expected, function () {
        var gold = computePatternValue(test.arg)
        assert.equal(gold, test.expected)
      })
    })

    it('High strenght', function () {
      var pattern = JSON.parse('{"Strenght":{"level":601}}')
      var value = 601
      var gold = computePatternValue(pattern)
      assert.equal(gold, value)
    })

    it('High Defense', function () {
      var pattern = JSON.parse('{"Defense":{"level":32}}')
      var value = 994
      var gold = computePatternValue(pattern)
      assert.equal(gold, value)
    })

    it('High Power', function () {
      var pattern = JSON.parse('{"Power":{"level":34}}')
      var value = 887
      var gold = computePatternValue(pattern)
      assert.equal(gold, value)
    })

  })
  describe('increaseRandomly()', function () {
    var tests = [10, 20, 31, 51, 107, 289, 467, 900, 1700, 34555]
    it('should be an object ', function () {
      // 1 correspond to golds
      var e = new Ennemy()
      e.implementAllUpgrades()
      e = increaseRandomly(e)
      assert.isObject(e, 'ennemy is an object')
    });
    tests.forEach(function (value) {
      it('should have the correct price for ' + value, function () {

        // 1 correspond to golds
        var e = new Ennemy()
        e.implementAllUpgrades()
        e = increaseRandomly(e, value)
        var gold = computePatternValue(e.pattern)
        assert.equal(gold, value)
      })
    })
  })
  describe('implementPattern()', function () {
    it('should create a not empty pattern', function () {
      var h = new Hero()
      h.implementAllUpgrades()
      var pattern = JSON.parse('{"Strenght":{"level":601}}')
      h.implementPattern(pattern)
      assert(h.pattern)
    })
    var tests = [
      JSON.parse('{"Strenght":{"level":601}}'),
      JSON.parse('{"Defense":{"level":32}}'),
      JSON.parse('{"Power":{"level":34}}'),
      JSON.parse('{"Strenght":{"level":50},"Life":{"level":50},"Power":{"level":26},"LifeSteal":{"level":11},"Defense":{"level":10},"AutoAttack":{"level":0},"CriticalChance":{"level":11},"CriticalDamage":{"level":11},"Magic":{"level":11},"FireBall":{"level":1},"Heal":{"level":1},"AlternateGameplay":{"level":1},"TypeFighting":{"level":9},"TypeFightingSpeed":{"level":1}}')
    ]
    tests.forEach(function(pattern){
      it('pattern corresponding DEEPLY to the one given', function() {
        var h = new Hero()
        h.implementAllUpgrades()
        h.implementPattern(pattern)
//        assert.deepEqual(h.pattern, pattern)
        for ( var p in h.pattern) {
//          assert.deepEqual(h.pattern[p], pattern[p] )
          expect(h.pattern[p]).to.deep.equal(pattern[p])
        }
      })
      
    })

  })
});
