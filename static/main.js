/*
 *  Main function to set the clock times
 */

var NEW_YEAR_MOMENT = moment("2016-01-01");
var NEW_YEAR_MOMENT = moment().add(10, 's');
moment.locale('en');

var App = function() {
  window.addEventListener('load', this.init.bind(this), false);
}

var AudioPlayer = function() {
  this.init();
}

App.fn = App.prototype;

App.fn.init = function() {
  // cache dom elements
  this.initDomCache();
  // Initialise the locale-enabled clocks
  // this.initInternationalClocks();
  // Initialise any local time clocks
  this.initLocalClocks();
  // Start the seconds container moving
  this.moveSecondHands();
  // Set the intial minute hand container transition, and then each subsequent step
  this.setUpMinuteHands();
  // Set Snow
  this.initSnow();
  // turn on the audio player
  this.initAudioPlayer();

  var $clock = document.querySelector('.clock');
  $clock.className += " show";
} 

App.fn.initDomCache = function() {
  this.$app = document.querySelector(".app");
  this.$countdown = this.$app.querySelector(".countdown");
  this.$timeRemaining = this.$app.querySelector(".time-remaining");
  this.$clock = this.$app.querySelector(".clock");
  this.$clocks = this.$app.querySelector(".clocks");
  this.$endMessage = this.$app.querySelector(".end-message");
}

App.fn.initAudioPlayer = function() {
    this.audioPlayer = new AudioPlayer();
    this.audioPlayer.play('./static/sounds/tick-tock.wav', {loop: true});
    this.audioPlayer.play('./static/sounds/kygo.mp3', {loop: true, startAt: 30});
}

App.fn.updateCountdown = function() {
  var countDownShowing = false;
  var that = this;

  var secondsLeft = NEW_YEAR_MOMENT.diff(moment(), 'seconds');

  if (secondsLeft <= 0) {
    that.$countdown.classList.remove("show");
    that.$timeRemaining.classList.remove("show");
    countDownShowing = false;
  }
  else if (secondsLeft <= 60) {
    if (!countDownShowing) {
        that.$countdown.classList.add("show");
        countDownShowing = true;
    }
    that.$timeRemaining.classList.remove("show");
    that.$countdown.innerHTML = secondsLeft;
  }
  else {
    that.$timeRemaining.innerHTML = moment("2016-01-01").fromNow();
  }

  return secondsLeft;
}

/*
 *  Set up an entry for each locale of clock we want to use
 */
 function getTimes() {
  moment.tz.add([
    'Eire|GMT IST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00',
    'Asia/Tokyo|JST|-90|0|',
    'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0',
    'Asia/Kolkata|HMT BURT IST IST|-5R.k -6u -5u -6u|01232|-18LFR.k 1unn.k HB0 7zX0|15e6'
    ]);
  var now = new Date();
  // Set the time manually for each of the clock types we're using
  var times = [
    {
      jsclass: 'js-tokyo',
      jstime: moment.tz(now, "Asia/Tokyo")
    },
    {
      jsclass: 'js-london',
      jstime: moment.tz(now, "Eire")
    },
    {
      jsclass: 'js-new-york',
      jstime: moment.tz(now, "America/New_York")
    },
    {
      jsclass: 'js-india',
      jstime: moment.tz(now, "Asia/Kolkata")
    }
  ];
  return times;
}

/*
 * Set up the clocks that use moment.js
 */
function initInternationalClocks() {
  // Initialise the clock settings and the three times
  var times = getTimes();
  for (i = 0; i < times.length; ++i) {
    var hours = times[i].jstime.format('h');
    var minutes = times[i].jstime.format('mm');
    var seconds = times[i].jstime.format('ss');

    var degrees = [
      {
        hand: 'hours',
        degree: (hours * 30) + (minutes / 2)
      },
      {
        hand: 'minutes',
        degree: (minutes * 6)
      },
      {
        hand: 'seconds',
        degree: (seconds * 6)
      }
    ];
    for (var j = 0; j < degrees.length; j++) {
      var elements = document.querySelectorAll('.active .' + times[i].jsclass + ' .' + degrees[j].hand);
      for (var k = 0; k < elements.length; k++) {
        	elements[k].style.webkitTransform = 'rotateZ('+ degrees[j].degree +'deg)';
          elements[k].style.transform = 'rotateZ('+ degrees[j].degree +'deg)';
          // If this is a minute hand, note the seconds position (to calculate minute position later)
          if (degrees[j].hand === 'minutes') {
            elements[k].parentNode.setAttribute('data-second-angle', degrees[j + 1].degree);
          }
      }
    }
  }
  // Add a class to the clock container to show it
  var elements = document.querySelectorAll('.clock');
  for (var l = 0; l < elements.length; l++) {
    elements[l].className = elements[l].className + ' show';
  }
}

/*
 * Starts any clocks using the user's local time
 */
App.fn.initLocalClocks = function() {
  // Get the local time using JS
  var date = new Date;
  var seconds = date.getSeconds();
  var minutes = date.getMinutes();
  var hours = date.getHours();

  // Create an object with each hand and it's angle in degrees
  var hands = [
    {
      hand: 'hours',
      angle: (hours * 30) + (minutes / 2)
    },
    {
      hand: 'minutes',
      angle: (minutes * 6)
    },
    {
      hand: 'seconds',
      angle: (seconds * 6)
    }
  ];
  // Loop through each of these hands to set their angle
  for (var j = 0; j < hands.length; j++) {
    var elements = document.querySelectorAll('.local .' + hands[j].hand);
    for (var k = 0; k < elements.length; k++) {
        elements[k].style.transform = 'rotateZ('+ hands[j].angle +'deg)';
        // If this is a minute hand, note the seconds position (to calculate minute position later)
        if (hands[j].hand === 'minutes') {
          elements[k].parentNode.setAttribute('data-second-angle', hands[j + 1].angle);
        }
    }
  }
}

/*
 * Move the second containers
 */
App.fn.moveSecondHands = function() {
  var containers = document.querySelectorAll('.bounce .seconds-container');
  var that = this;
  var secondsLeft;
  setInterval(function() {
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].angle === undefined) {
        containers[i].angle = 6;
      } else {
        containers[i].angle += 6;
      }
      containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
      containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
    }
    if (secondsLeft > 0) {
      that.audioPlayer.play('./static/sounds/heavy-clock-tick.mp3');
    }
    secondsLeft = that.updateCountdown();
    if (secondsLeft === 0) {
      that.$clock.classList.add("zoomOut", "animated");
      that.$endMessage.classList.add("show", "zoomInDown", "animated");
      that.audioPlayer.stop();
      that.audioPlayer.play('./static/sounds/cant-feel-my-face.mp3', {loop: true, startAt: 45});
    }
  }, 1000);
  for (var i = 0; i < containers.length; i++) {
    // Add in a little delay to make them feel more natural
    var randomOffset = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    containers[i].style.transitionDelay = '0.0'+ randomOffset +'s';
  }
}

/*
 * Set a timeout for the first minute hand movement (less than 1 minute), then rotate it every minute after that
 */
App.fn.setUpMinuteHands = function() {
  // More tricky, this needs to move the minute hand when the second hand hits zero
  var containers = document.querySelectorAll('.minutes-container');
  var secondAngle = containers[containers.length - 1].getAttribute('data-second-angle');
  console.log(secondAngle);
  if (secondAngle > 0) {
    // Set a timeout until the end of the current minute, to move the hand
    var delay = (((360 - secondAngle) / 6) + 0.1) * 1000;
    console.log(delay);
    setTimeout(function() {
      moveMinuteHands(containers);
    }, delay);
  }
}

/*
 * Do the first minute's rotation, then move every 60 seconds after
 */
App.fn.moveMinuteHands = function(containers) {
  for (var i = 0; i < containers.length; i++) {
    containers[i].style.webkitTransform = 'rotateZ(6deg)';
    containers[i].style.transform = 'rotateZ(6deg)';
  }
  // Then continue with a 60 second interval
  setInterval(function() {
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].angle === undefined) {
        containers[i].angle = 12;
      } else {
        containers[i].angle += 6;
      }
      containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
      containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
    }
  }, 60000);
}

/*
 * Let's add some snow
 */

App.fn.initSnow = function() {
  //canvas init
  var canvas = document.getElementById("snow");
  var ctx = canvas.getContext("2d");

  //canvas dimensions
  var W = window.innerWidth;
  var H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  //snowflake particles
  var mp = 25; //max particles
  var particles = [];
  for(var i = 0; i < mp; i++)
  {
    particles.push({
      x: Math.random()*W, //x-coordinate
      y: Math.random()*H, //y-coordinate
      r: Math.random()*4+1, //radius
      d: Math.random()*mp //density
    })
  }

  //Lets draw the flakes
  function draw()
  {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(243, 243, 243, 0.8)";
    ctx.beginPath();
    for(var i = 0; i < mp; i++)
    {
      var p = particles[i];
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
    }
    ctx.fill();
    update();
  }

  //Function to move the snowflakes
  //angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
  var angle = 0;
  function update()
  {
    angle += 0.01;
    for(var i = 0; i < mp; i++)
    {
      var p = particles[i];
      //Updating X and Y coordinates
      //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
      //Every particle has its own density which can be used to make the downward movement different for each flake
      //Lets make it more random by adding in the radius
      p.y += Math.cos(angle+p.d) + 1 + p.r/2;
      p.x += Math.sin(angle) * 2;

      //Sending flakes back from the top when it exits
      //Lets make it a bit more organic and let flakes enter from the left and right also.
      if(p.x > W+5 || p.x < -5 || p.y > H)
      {
        if(i%3 > 0) //66.67% of the flakes
        {
          particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
        }
        else
        {
          //If the flake is exitting from the right
          if(Math.sin(angle) > 0)
          {
            //Enter from the left
            particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
          }
          else
          {
            //Enter from the right
            particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
          }
        }
      }
    }
  }
  //animation loop
  setInterval(draw, 33);
}

AudioPlayer.fn = AudioPlayer.prototype;

AudioPlayer.fn.init = function() {
  var that = this;
  this._cache = {};
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    that.context = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
};

AudioPlayer.fn._load = function(url, callback) {
  var request = new XMLHttpRequest();
  var that = this;
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  return request;
};

AudioPlayer.fn.stop = function(url) {
  var that = this;

  if (url) {
    this._cache[url] && this._cache[url].stop();
  }
  else {
    // stop all audio
    Object.keys(this._cache).forEach(function(k) { 
      that._cache[k].stop(); 
    });
  }
};

AudioPlayer.fn.play = function(url, options) {
  var that = this;
  var onError = function() {};
  var request;
  var options = options || {};

  if (this._cache[url]) {
    var source = that.context.createBufferSource();
    source.buffer = this._cache[url].buffer;
    source.connect(this.context.destination);
    if (options.loop) source.loop = true;
    source.start(options.startAt || 0);
  }
  else {
      request = this._load(url);
      request.onload = function() {
        that.context.decodeAudioData(request.response, function(buffer) {
          var source = that.context.createBufferSource();
          source.buffer = buffer;
          that._cache[url] = source;
          source.connect(that.context.destination);
          if (options.loop) source.loop = true;
          source.start(options.startAt || 0);
        }, onError);
      }
      request.send();
  }
};

var app = new App();
