/*
  Welcome to the Harmonic source code!
  
  Good to know:
    * Pitch is relative to C4, so a pitch of 0 is equal to the key C4 (middle C)
    * Harmonic will get the display name of an instrument from the instruments name property
    * Harmonic will only send note data to an instrument if it's initialized property is true
  
  TODO:
    * Window snapping
*/

var harmonic = {};

harmonic.keybinds = {
    "KeyZ": -12,
    "KeyS": -11,
    "KeyX": -10,
    "KeyD": -9,
    "KeyC": -8,
    "KeyV": -7,
    "KeyG": -6,
    "KeyB": -5,
    "KeyH": -4,
    "KeyN": -3,
    "KeyJ": -2,
    "KeyM": -1,
    "Comma": 0,
    "KeyL": 1,
    "Period": 2,
    "Semicolon": 3,
    "Slash": 4,
    "KeyQ": 0,
    "Digit2": 1,
    "KeyW": 2,
    "Digit3": 3,
    "KeyE": 4,
    "KeyR": 5,
    "Digit5": 6,
    "KeyT": 7,
    "Digit6": 8,
    "KeyY": 9,
    "Digit7": 10,
    "KeyU": 11,
    "KeyI": 12,
    "Digit9": 13,
    "KeyO": 14,
    "Digit0": 15,
    "KeyP": 16,
    "BracketLeft": 17,
    "Equal": 18,
    "BracketRight": 19
};

harmonic.keysDown = [];


// Lib functions
harmonic.getFrequencyByPitch = function(pitch) {
  return 440 * Math.pow(Math.pow(2, 1/12), pitch - 9);
};

// Interface
harmonic.windows = [];

harmonic.windowSnapRange = 12;

harmonic.selectWindow = function(index) {
  if (index != -1) {
    harmonic.windows.unshift(harmonic.windows.splice(index, 1)[0]);
  }
  harmonic.windows.forEach(function(harmonicWindow, index) {
    harmonicWindow.element.style.zIndex = harmonic.windows.length - index;
    harmonicWindow.element.className = "window" + (harmonicWindow.resizable ? " resizable" : "");
  });
  if (index != -1) {
    harmonic.windows[0].element.className = "window" + (harmonic.windows[0].resizable ? " resizable" : "") + " selected";
  }
};

harmonic.createWindow = function(x, y, width, height, title, resizable, content, minWidth, minHeight) {
  var dragging = "none",
      dragOffsetX = 0,
      dragOffsetY = 0,
      originalX = 0,
      originalY = 0,
      originalWidth = 0,
      originalHeight = 0;
  
  var windowElement = document.createElement("div");
  
  var windowObject = {
    element: windowElement,
    x: x,
    y: y,
    width: width,
    height: height,
    resizable: resizable
  };
  
  windowElement.className = "window";
  windowElement.style.top = y + "px";
  windowElement.style.left = x + "px";
  windowElement.style.width = width + "px";
  windowElement.style.height = height + "px";
  windowElement.onmousedown = function(event) {
    event.stopPropagation();
    harmonic.selectWindow(harmonic.windows.indexOf(windowObject));
  };
  
  if (resizable) {
    ["n", "w", "s", "e", "nw", "sw", "se", "ne"].forEach(function(dir) {
      var resize = document.createElement("div");
      resize.className = "resize-" + dir;
      switch(dir) {
        case "n": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-n";
              dragOffsetY = event.pageY - this.parentElement.getBoundingClientRect().top;
              originalHeight = event.pageY + height;
            }
          };
          break;
        }
        case "w": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-w";
              dragOffsetX = event.pageX - this.parentElement.getBoundingClientRect().left;
              originalWidth = event.pageX + width;
            }
          };
          break;
        }
        case "s": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-s";
              dragOffsetY = event.pageY - height;
            }
          };
          break;
        }
        case "e": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-e";
              dragOffsetX = event.pageX - width;
            }
          };
          break;
        }
        case "nw": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-nw";
              dragOffsetX = event.pageX - this.parentElement.getBoundingClientRect().left;
              dragOffsetY = event.pageY - this.parentElement.getBoundingClientRect().top;
              originalWidth = event.pageX + width;
              originalHeight = event.pageY + height;
            }
          };
          break;
        }
        case "sw": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-sw";
              dragOffsetX = event.pageX - this.parentElement.getBoundingClientRect().left;
              dragOffsetY = event.pageY - height;
              originalWidth = event.pageX + width;
            }
          };
          break;
        }
        case "se": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-se";
              dragOffsetX = event.pageX - width;
              dragOffsetY = event.pageY - height;
            }
          };
          break;
        }
        case "ne": {
          resize.onmousedown = function(event) {
            if (event.button === 0) {
              dragging = "resize-ne";
              dragOffsetX = event.pageX - width;
              dragOffsetY = event.pageY - this.parentElement.getBoundingClientRect().top;
              originalHeight = event.pageY + height;
            }
          };
          break;
        }
      }
      windowElement.appendChild(resize);
    });
  }
  
  var titleBar = document.createElement("div");
  titleBar.className = "title-bar";
  var titleElement = document.createElement("span");
  titleElement.innerHTML = title;
  titleBar.appendChild(titleElement);
  titleBar.onmousedown = function(event) {
    if (event.button === 0) {
      dragging = "window";
      dragOffsetX = event.pageX - this.getBoundingClientRect().left + 6;
      dragOffsetY = event.pageY - this.getBoundingClientRect().top + 6;
    }
  };
  window.addEventListener("mouseup", function(event) {
    if (event.button === 0) {
      dragging = "none";
    }
  });
  function getSnap(x, y) {
    var newX = x;
    var newY = y;
    harmonic.windows.forEach(function(harmonicWindow) {
      var bounds = {
        top: harmonicWindow.y,
        left: harmonicWindow.x,
        bottom: harmonicWindow.y + harmonicWindow.height,
        right: harmonicWindow.x + harmonicWindow.width,
        width: harmonicWindow.width,
        height: harmonicWindow.height
      };
      if (x + width > bounds.left - harmonic.windowSnapRange && x < bounds.right + harmonic.windowSnapRange) {
        if (Math.abs(bounds.bottom - y) < harmonic.windowSnapRange) {
          newY = bounds.bottom;
        }
        if (Math.abs(bounds.top - (y + height)) < harmonic.windowSnapRange) {
          newY = bounds.top - height;
        }
      }
      if (y + height > bounds.top - harmonic.windowSnapRange && y < bounds.bottom + harmonic.windowSnapRange) {
        if (Math.abs(bounds.right - x) < harmonic.windowSnapRange) {
          newX = bounds.right;
        }
        if (Math.abs(bounds.left - (x + width)) < harmonic.windowSnapRange) {
          newX = bounds.left - width;
        }
      }
    });
    return {x: newX, y: newY};
  }
  window.addEventListener("mousemove", function(event) {
    if (event.buttons % 2) {
      switch(dragging) {
        case "window": {
          var snap = getSnap(event.pageX - dragOffsetX - document.getElementById("workspace").getBoundingClientRect().left,
                             event.pageY - dragOffsetY - document.getElementById("workspace").getBoundingClientRect().top);
          x = snap.x;
          y = snap.y;
          windowElement.style.top = y + "px";
          windowElement.style.left = x + "px";
          break;
        }
        case "resize-n": {
          y = Math.min(event.pageY, originalHeight - (minHeight + 32)) - dragOffsetY - document.getElementById("workspace").getBoundingClientRect().top;
          height = Math.max(originalHeight - event.pageY, minHeight + 32);
          windowElement.style.top = y + "px";
          windowElement.style.height = height + "px";
          break;
        }
        case "resize-w": {
          x = Math.min(event.pageX, originalWidth - (minWidth + 12)) - dragOffsetX - document.getElementById("workspace").getBoundingClientRect().left;
          width = Math.max(originalWidth - event.pageX, minWidth + 12);
          windowElement.style.left = x + "px";
          windowElement.style.width = width + "px";
          break;
        }
        case "resize-s": {
          height = Math.max(event.pageY - dragOffsetY, minHeight + 32);
          windowElement.style.height = height + "px";
          break;
        }
        case "resize-e": {
          width = Math.max(event.pageX - dragOffsetX, minWidth + 12);
          windowElement.style.width = width + "px";
          break;
        }
        case "resize-nw": {
          x = Math.min(event.pageX, originalWidth - (minWidth + 12)) - dragOffsetX - document.getElementById("workspace").getBoundingClientRect().left;
          y = Math.min(event.pageY, originalHeight - (minHeight + 32)) - dragOffsetY - document.getElementById("workspace").getBoundingClientRect().top;
          width = Math.max(originalWidth - event.pageX, minWidth + 12);
          height = Math.max(originalHeight - event.pageY, minHeight + 32);
          windowElement.style.left = x + "px";
          windowElement.style.top = y + "px";
          windowElement.style.width = width + "px";
          windowElement.style.height = height + "px";
          break;
        }
        case "resize-sw": {
          x = Math.min(event.pageX, originalWidth - (minWidth + 12)) - dragOffsetX - document.getElementById("workspace").getBoundingClientRect().left;
          width = Math.max(originalWidth - event.pageX, minWidth + 12);
          height = Math.max(event.pageY - dragOffsetY, minHeight + 32);
          windowElement.style.left = x + "px";
          windowElement.style.width = width + "px";
          windowElement.style.height = height + "px";
          break;
        }
        case "resize-se": {
          width = Math.max(event.pageX - dragOffsetX, minWidth + 12);
          height = Math.max(event.pageY - dragOffsetY, minHeight + 32);
          windowElement.style.width = width + "px";
          windowElement.style.height = height + "px";
          break;
        }
        case "resize-ne": {
          y = Math.min(event.pageY, originalHeight - (minHeight + 32)) - dragOffsetY - document.getElementById("workspace").getBoundingClientRect().top;
          width = Math.max(event.pageX - dragOffsetX, minWidth + 12);
          height = Math.max(originalHeight - event.pageY, minHeight + 32);
          windowElement.style.top = y + "px";
          windowElement.style.width = width + "px";
          windowElement.style.height = height + "px";
          break;
        }
      }
      harmonic.windows[0].x = x;
      harmonic.windows[0].y = y;
      harmonic.windows[0].width = width;
      harmonic.windows[0].height = height;
    } else {
      dragging = "none";
    }
  });
  windowElement.appendChild(titleBar);
  
  var contentElement = document.createElement("div");
  contentElement.className = "content";
  contentElement.appendChild(content);
  windowElement.appendChild(contentElement);
  
  document.getElementById("workspace").appendChild(windowElement);
  
  harmonic.selectWindow(harmonic.windows.push(windowObject) - 1);
};


var instrument = {};

instrument.selected = null;

instrument.list = {};

instrument.updateList = function() {
  document.getElementById("instrument-select").innerHTML = "";
  for (var i in this.list) {
    var option = document.createElement("option");
    option.value = i;
    option.innerHTML = this.list[i].name;
    document.getElementById("instrument-select").appendChild(option);
  }
  document.getElementById("instrument-select").value = this.selected;
};

instrument.create = function(id, object) {
  instrument.list[id] = object;
  instrument.list[id].init(harmonic.masterVolume);
  instrument.updateList();
}

instrument.select = function(id) {
  instrument.selected = id;
  
  document.getElementById("instrument-window").innerHTML = "";
  
  var guiInstrument = instrument.list[instrument.selected].gui.instrument;
  
  function parseElement(element, parent) {
    switch(element.type) {
      case "container": {
        var container = document.createElement("div");
        container.style.left = element.x + "px";
        container.style.top = element.y + "px";
        container.style.width = element.width + "px";
        container.style.height = element.height + "px";
        parent.appendChild(container);
        element.children.forEach(function(child) {
          parseElement(child, container);
        });
        break;
      }
      case "text": {
        var text = document.createElement("span");
        text.style.left = element.x + "px";
        text.style.top = element.y + "px";
        text.innerHTML = element.text;
        text.style.fontSize = element.fontSize + "px";
        text.style.fontWeight = element.bold ? "bold" : "normal";
        text.style.fontStyle = element.italic ? "italic" : "normal";
        parent.appendChild(text);
        break;
      }
      case "number": {
        var number = document.createElement("input");
        number.style.left = element.x + "px";
        number.style.top = element.y + "px";
        number.type = "number";
        number.min = element.min;
        number.max = element.max;
        number.value = element.value;
        number.oninput = function(event) {
          if (isFinite(parseFloat(this.value))) {
            element.oninput(parseFloat(this.value), guiInstrument);
          }
        };
        parent.appendChild(number);
        break;
      }
      case "dropdown": {
        var dropdown = document.createElement("select");
        dropdown.style.left = element.x + "px";
        dropdown.style.top = element.y + "px";
        element.options.forEach(function(option) {
          var optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.innerHTML = option;
          dropdown.appendChild(optionElement);
        });
        dropdown.value = element.value;
        dropdown.oninput = function(event) {
          element.oninput(this.value, guiInstrument);
          dropdown.blur();
        };
        parent.appendChild(dropdown);
        break;
      }
      case "file": {
        var file = document.createElement("input");
        file.style.left = element.x + "px";
        file.style.top = element.y + "px";
        file.type = "file";
        file.accept = element.accept;
        file.onchange = function(event) {
          element.oninput(this.files, guiInstrument);
        };
        parent.appendChild(file);
        break;
      }
      case "html": {
        parent.appendChild(element.html);
      }
    }
  }
  document.getElementById("instrument-window").style.width = instrument.list[instrument.selected].gui.width + "px";
  document.getElementById("instrument-window").style.height = instrument.list[instrument.selected].gui.height + "px";
  
  instrument.list[instrument.selected].gui.children.forEach(function(child) {
    parseElement(child, document.getElementById("instrument-window"));
  });
};



// The real shit
harmonic.noteOn = function(pitch, velocity) {
  if (instrument.list[instrument.selected].initialized) {
    if (typeof harmonic.keysDown[pitch] === "undefined") {
      if (document.getElementById("pianorollkey-" + pitch)) {
        document.getElementById("pianorollkey-" + pitch).className += " active";
        document.getElementById("pianorollrow-" + pitch).className += " active";
      }
      if (document.getElementById("pianokey-" + pitch)) {
        document.getElementById("pianokey-" + pitch).className += " active";
      }
      harmonic.keysDown[pitch] = instrument.list[instrument.selected].noteOn(pitch, velocity);
    }
  }
};

harmonic.noteOff = function(pitch, velocity) {
  if (instrument.list[instrument.selected].initialized) {
    if (typeof harmonic.keysDown[pitch] !== "undefined") {
      if (document.getElementById("pianorollkey-" + pitch)) {
        document.getElementById("pianorollkey-" + pitch).className = document.getElementById("pianorollkey-" + pitch).className.replace(" active", "");
        document.getElementById("pianorollrow-" + pitch).className = document.getElementById("pianorollrow-" + pitch).className.replace(" active", "");
      }
      if (document.getElementById("pianokey-" + pitch)) {
        document.getElementById("pianokey-" + pitch).className = document.getElementById("pianokey-" + pitch).className.replace(" active", "");
      }
      instrument.list[instrument.selected].noteOff(harmonic.keysDown[pitch], velocity);
      delete harmonic.keysDown[pitch];
    }
  }
};

harmonic.Channel = function() {
  this.in = new Tone.Signal();
  this.out = new Tone.Signal();

  var effects = [];
  this.effects = effects;

  var connectEffects = function() {
    if (effects.length) {
      this.in.connect(effects[0]);

      var maxIndex = effects.length - 1;
      for (var i = 0; i < maxIndex; i++) {
        effects[i].connect(effects[i+1]);
      }
      effects[maxIndex].connect(this.out);
    } else {
      this.in.connect(this.out);
    }
  };
  this.connectEffects = connectEffects;

  var disconnectEffects = function() {
    this.in.disconnect();

    if (effects.length) {
      for (var i = 0; i < effects.length; i++) {
        effects[i].disconnect();
      }
    }
  };
  this.disconnectEffects = disconnectEffects;
};

harmonic.init = function() {
  var audioContext = window.AudioContext    ||
                     window.webAudioContext ||
                     window.mozAudioContext ||
                     window.oAudioContext   ||
                     window.msAudioContext;
  if (audioContext) {
  	harmonic.audioContext = Tone.audioContext;

    // Set up mixer
    harmonic.mixer = function() {
      this.master = new Tone.Signal();
      this.master.receive("master");
      this.channels = [];
      this.channels.push(new harmonic.Channel());

      var masterGain = new Tone.Gain();

      this.channels[0].in.receive("osc");
      this.channels[0].connectEffects();
      this.channels[0].out.connect(masterGain);

      this.analyser = new Tone.Analyser("waveform");
      masterGain.connect(analyser).connect(Tone.Master);

      return this;
    }();
    harmonic.render = function() {
      var ctx = document.getElementById("oscilloscope").getContext("2d");
      ctx.clearRect(0, 0, 150, 40);

      var buffer = harmonic.mixer.analyser.analyse();
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#dde5e9";
      ctx.beginPath();
      
      var x = 0;
      ctx.moveTo(0, buffer[0] / 128 * 20);
      buffer.forEach(function(data) {
        ctx.lineTo(x, data / 128 * 20);
        
        x += 150 / buffer.length;
      });
      ctx.stroke();
      
      window.requestAnimationFrame(harmonic.render);
    };
    harmonic.render();
    
    // Create default instruments
    instrument.create("osc", {
      name: "3xOsc",
      initialized: false,
      keys: [],
      options: {
        oscs: [
          {
            type: "sawtooth",
            pitchBend: 0
          },
          {
            type: "sawtooth",
            volume: 1,
            pitchBend: -12
          },
          {
            type: "square",
            volume: 1,
            pitchBend: 0
          }
        ]
      },
      init: function() {
        this.output = new Tone.Signal();
        this.output.send("osc");

        this.initialized = true;
        
        this.gui = {
          instrument: this,
          width: 300,
          height: 400,
          children: [
            {
              type: "container",
              x: 0,
              y: 0,
              width: 300,
              height: 100,
              children: [
                {
                  type: "text",
                  x: 10,
                  y: 10,
                  text: "Oscillator 1",
                  fontSize: 20,
                  bold: true,
                  italic: false
                },
                {
                  type: "dropdown",
                  x: 20,
                  y: 40,
                  options: [
                    "sine",
                    "square",
                    "sawtooth",
                    "triangle"
                  ],
                  value: "sawtooth",
                  oninput: function(value, instrument) {
                    instrument.options.oscs[0].type = value;
                  }
                },
                {
                  type: "number",
                  x: 20,
                  y: 70,
                  min: -120,
                  max: 120,
                  value: 0,
                  oninput: function(value, instrument) {
                    instrument.options.oscs[0].pitchBend = value;
                  }
                }
              ]
            },
            {
              type: "container",
              x: 0,
              y: 100,
              width: 300,
              height: 100,
              children: [
                {
                  type: "text",
                  x: 10,
                  y: 10,
                  text: "Oscillator 2",
                  fontSize: 20,
                  bold: true,
                  italic: false
                },
                {
                  type: "dropdown",
                  x: 20,
                  y: 40,
                  options: [
                    "sine",
                    "square",
                    "sawtooth",
                    "triangle"
                  ],
                  value: "sawtooth",
                  oninput: function(value, instrument) {
                    instrument.options.oscs[1].type = value;
                  }
                },
                {
                  type: "number",
                  x: 20,
                  y: 70,
                  min: -120,
                  max: 120,
                  value: -12,
                  oninput: function(value, instrument) {
                    instrument.options.oscs[1].pitchBend = value;
                  }
                }
              ]
            },
            {
              type: "container",
              x: 0,
              y: 200,
              width: 300,
              height: 100,
              children: [
                {
                  type: "text",
                  x: 10,
                  y: 10,
                  text: "Oscillator 3",
                  fontSize: 20,
                  bold: true,
                  italic: false
                },
                {
                  type: "dropdown",
                  x: 20,
                  y: 40,
                  options: [
                    "sine",
                    "square",
                    "sawtooth",
                    "triangle"
                  ],
                  value: "square",
                  oninput: function(value, instrument) {
                    instrument.options.oscs[2].type = value;
                  }
                },
                {
                  type: "number",
                  x: 20,
                  y: 70,
                  min: -120,
                  max: 120,
                  value: 0,
                  oninput: function(value, instrument) {
                    instrument.options.oscs[2].pitchBend = value;
                  }
                }
              ]
            }
          ]
        };



        this.oscs = [];
        for (var i = 0; i < 3; i++) {
          var osc = new Tone.Synth();
          osc.connect(this.output);
          osc.options = this.options.oscs[i];
          this.oscs.push(osc);
        }
      },
      noteOn: function(pitch, velocity) {
        for (var i = 0; i < 3; i++) {
          var osc = this.oscs[i];
          osc.triggerAttack(harmonic.getFrequencyByPitch(pitch + osc.options.pitchBend));
        }
        return {pitch, velocity};
      },
      noteOff: function(id, velocity) {
        for (var i = 0; i < 3; i++) {
          var osc = this.oscs[i];
          osc.triggerRelease();
        }
      },
      tick: function() {}
    });
    
    // Piano instrument, currently disabled
    if (false) {
      instrument.create("piano", {
        name: "Piano",
        initialized: false,
        keys: [],
        options: {},
        init: function(audioOutput) {
          this.output = audioOutput;
          
          Soundfont.instrument(harmonic.audioContext, "https://rawgit.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_grand_piano-mp3.js").then(function(player) {
            this.player = player;
            console.log(player);
          }.bind(this));
          
          // Return gui object
          this.gui = {
            instrument: this,
            width: 300,
            height: 400,
            children: [
              {
                type: "dropdown",
                x: 10,
                y: 10,
                options: [
                  "sine",
                  "square",
                  "sawtooth",
                  "triangle"
                ],
                value: "sawtooth",
                oninput: function(value, instrument) {
                  instrument.options.osc1.type = value;
                }
              },
              {
                type: "text",
                x: 10,
                y: 10,
                text: "WIP",
                fontSize: 150,
                bold: true,
                italic: false
              }
            ]
          };
          
          this.initialized = true;
        },
        noteOn: function(pitch, velocity) {
          return this.keys.push({
            pitch: pitch,
            velocity: velocity,
            init: function(output, player, options) {
              player.play(pitch + 48);
              return this;
            },
            kill: function() {
              
            }
          }.init(this.output, this.player, this.options)) - 1;
        },
        noteOff: function(id, velocity) {
          if (this.keys[id]) {
            this.keys[id].kill();
            
            delete this.keys[id];
          }
        },
        tick: function() {}
      });
    }
    
    // soundfont player, currently disabled
    if (false) {
      instrument.create("soundfont", {
        name: "Soundfont Player",
        initialized: false,
        keys: [],
        options: {},
        init: function(audioOutput) {
          this.output = audioOutput;
          
          Soundfont.instrument(harmonic.audioContext, "https://rawgit.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/bright_acoustic_piano-mp3.js").then(function(player) {
            this.player = player;
            console.log(player);
          }.bind(this));
          
          // Return gui object
          this.gui = {
            instrument: this,
            width: 300,
            height: 400,
            children: [
              {
                type: "file",
                x: 10,
                y: 10,
                accept: ".sf2",
                oninput: function(files, instrument) {
                  var file = files[0];
                  
                  var reader = new FileReader();
                  reader.onload = function(event) {
                    console.log(event.target.result);
                  };
                  reader.readAsArrayBuffer(file);
                }
              },
              {
                type: "text",
                x: 10,
                y: 10,
                text: "WIP",
                fontSize: 150,
                bold: true,
                italic: false
              }
            ]
          };
          
          this.initialized = true;
        },
        noteOn: function(pitch, velocity) {
          return this.keys.push({
            pitch: pitch,
            velocity: velocity,
            init: function(output, player, options) {
              player.play(pitch + 48);
              return this;
            },
            kill: function() {
              
            }
          }.init(this.output, this.player, this.options)) - 1;
        },
        noteOff: function(id, velocity) {
          if (this.keys[id]) {
            this.keys[id].kill();
            
            delete this.keys[id];
          }
        },
        tick: function() {}
      });
    }
    
    // Do de kol shit
    window.onkeydown = function(event) {
      if (harmonic.keybinds.hasOwnProperty(event.code)) {
        harmonic.noteOn(harmonic.keybinds[event.code], 100);
      }
    };
    
    window.onkeyup = function(event) {
      if (harmonic.keybinds.hasOwnProperty(event.code)) {
        harmonic.noteOff(harmonic.keybinds[event.code], 0);
      }
    };
    
    window.onmousedown = function(event) {
      harmonic.selectWindow(-1);
    };

    // Create mixer window
    var mixerElement = document.createElement("div");
    mixerElement.className += "mixer";
    var ChannelElement = function() {
      this.element = document.createElement("div");
      this.element.className += "mixer-channel";
      var volumeElement = document.createElement("div");
      volumeElement.className += "mixer-channel-volume";
      this.element.appendChild(volumeElement);

      var render = function() {
        var buffer = harmonic.mixer.analyser.analyse();

        // Root Mean Square
        var rms = 0;
        for (var i = 0; i < buffer.length; i++) {
          var sample = buffer[i];
          rms += sample * sample;
        }

        rms /= buffer.length;
        rms = (Math.sqrt(rms) - 128) * 20;

        console.log(rms);

        volumeElement.style.height = rms + "px";
        window.requestAnimationFrame(render);
      };
      render();
    };
    var masterChannel = new ChannelElement();
    mixerElement.appendChild(masterChannel.element);
    harmonic.createWindow(418, 200, 190, 428, "Mixer", false, mixerElement);
    
    // Create piano window
    var pianoLayout = [0,  1,   0,  1,   0,  0,  1,   0,  1,   0,  1,   0  ];
    var keyNames =    ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    var pianoElement = document.createElement("ul");
    pianoElement.className = "piano";
    for (var i=0; i<36; i++) {
      var element = document.createElement("li");
      element.id = "pianokey-" + (i - 12);
      element.className = (pianoLayout[i % pianoLayout.length]) ? "black" : "white";
      
      element.onmousedown = element.onmouseover = function(event) {
        if (event.buttons) {
          harmonic.noteOn(parseInt(event.target.id.slice(9)), 100);
          if (event.preventDefault) {
            event.preventDefault();
          }
          event.returnValue = false;
          return false;
        }
      };
      
      element.onmouseup = element.onmouseout = function(event) {
        harmonic.noteOff(parseInt(event.target.id.slice(9)), 0);
      };
      
      pianoElement.appendChild(element);
    }
    harmonic.createWindow(100, 10, 508, 180, "Piano", true, pianoElement, 200, 0);
    
    // Create instrument window
    var instrumentElement = document.createElement("div");
    instrumentElement.id = "instrument-window";
    harmonic.createWindow(100, 200, 308, 428, "Instrument", false, instrumentElement);
    
    // Create piano roll window
    var pianoRoll = document.createElement("div");
    pianoRoll.className = "piano-roll";
    
    var pianoRollPiano = document.createElement("ul");
    pianoRollPiano.className = "piano-preview";
    for (var j=12*11-1; j>=0; j--) {
      var key = document.createElement("li");
      key.id = "pianorollkey-" + (j - 48);
      key.className = (pianoLayout[j % 12] ? "black" : "white") + " " + keyNames[j % 12];
      if (pianoLayout[j % 12] === 0) {
        var label = document.createElement("span");
        label.className = "label";
        label.innerHTML = keyNames[j % 12] + Math.floor(j / 12);
        key.appendChild(label);
      }
      
      key.onmousedown = key.onmouseover = function(event) {
        if (event.buttons) {
          harmonic.noteOn(parseInt(event.target.id.slice(13)), 100);
          if (event.preventDefault) {
            event.preventDefault();
          }
          event.returnValue = false;
          return false;
        }
      };
      
      key.onmouseup = key.onmouseout = function(event) {
        harmonic.noteOff(parseInt(event.target.id.slice(13)), 0);
      };
      
      pianoRollPiano.appendChild(key);
    }
    pianoRoll.appendChild(pianoRollPiano);
    
    var pianoRollGrid = document.createElement("div");
    pianoRollGrid.className = "piano-roll-grid";
    for (var k=12*11-1; k>=0; k--) {
      var row = document.createElement("div");
      row.id = "pianorollrow-" + (k - 48);
      pianoRollGrid.appendChild(row);
    }
    pianoRoll.appendChild(pianoRollGrid);
    harmonic.createWindow(620, 10, 700, 518, "Piano Roll", true, pianoRoll, 200, 0);
    pianoRoll.scrollTop = 1400;
    
    
    instrument.select("osc");
    instrument.updateList();
  } else {
    alert("Your browser does not support the audio context! Please update your browser!");
  }
};

window.onload = harmonic.init;