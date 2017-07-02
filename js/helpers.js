// ========================================================================================================================
// Helpers

function randomArrayValue(arr) {
  var l = arr.length
  var i = ~~(Math.random() * l)
  return arr[i]
}

function displayAlert(alert = {}) {
  toastr[alert.type](alert.message)
}

function displayPreparedAlerts(name) {
  if (!Alerts[name]) {
    console.warn("Alert doesn't exist : ", name)
    return false
  }
  if (Alerts[name].displayed) {
    return false
  }
  displayAlert(Alerts[name])
  Alerts[name].displayed = true
}

function powLevel(level) {
  return Math.floor(1 * Math.pow(1.15, level))
}

function isArray(v) {
  return Object.prototype.toString.call([]) === '[object Array]'
}

// Return TRUE one time out of @param n
function wheel(n) {
  return Math.floor(Math.random() * n) == 0
}

function countFunc(n, cb, time) {
  var cpt = 0
  var tour = time || 100000
  for (var i = 0; i < tour; i++) {
    if (cb(n)) {
      cpt++
    }
  }
  return (cpt / tour).toFixed(3)
}

// @params breaker
function tryLoopMechanics(callback) {
  if (typeof (sliderLabel) == "number") {
    var i = 0
    var _continue = true
    while (i < sliderLabel && _continue) {
      _continue = callback()
      i++
    }
  } else {
    var _continue = true
    while (_continue) {
      _continue = callback()
    }
  }
}

function addTitle(u) {
  var title = u.name
  var desc = u.desc
  return "<span class='center-align'>- " + title + " -</span><br>" + desc
}

function smartRound(n) {
  return Math.round(n * 100) / 100
}

function isLetter(str) {
  return str.length === 1 && (str.match(/[a-z]/i) || str == "'" || str == "-");
}

function clone(obj) {
  if (null == obj || "object" != typeof obj) {
    console.error("Not an object")
    return obj;
  }
  var copy = {}
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

function filterObj(obj, cb) {
  if (null == obj || "object" != typeof obj) {
    console.error("Not an object")
    return obj;
  }
  var result = {};

  for (key in obj) {
    if (obj.hasOwnProperty(key) && cb(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
}

function randInt(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rand(min = 0, max = 1) {
  return Math.random() * (max - min + 1) + min;
}

var Text = {
  queue: [],
  throwText: function (text = "0x") {
    if (!CONF.bigNumbers) {
      return
    }
    this.queue.push(text)
    this.dequeue()
  },
  run: function (text = "0x") {
    var id = new Date()
    id = id.getTime()
    $('body')
      .append("<span class='throwText' id='" + id + "'>" + text + "</div>")
    $('#' + id)
      .css('color', getRandomColor())
      .css('font-size', 80 + randInt(-30, 30))
    setTimeout(function () {
      $('#' + id)
        .velocity("finish")
        .velocity("stop")
        .remove()
    }, 700)
  },
  dequeue: function () {
    if (this.queueing) {
      return
    }
    this.queueing = true
    var self = this
    this.id = setInterval(function () {
      var t = self.queue.shift()
      if (!t) {
        self.queueing = false
        clearInterval(self.id)
      } else {
        self.run(t)
      }
    }, 300)
  },
  stop: function() {
    this.queue = []
  }
}

function throwText(text = "0x") {
  Text.throwText(text)
}

function a() {
  throwText("a")
  throwText("b")
  throwText("c")
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function l(l = "___ test ___") {
  console.trace(l)
}

function computationTime(cb, nb) {
  if (!nb) {
    console.time()
    cb()
    console.timeEnd()
  } else {
    console.time()
    for (var i = 0; i < nb; i++) {
      cb()
    }
    console.timeEnd()
  }
}
