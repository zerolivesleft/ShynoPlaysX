let exec = require("child_process").exec,
  config = require("./config.js"),
  lastTime = {},
  windowID = "unfilled",
  throttledCommands = config.throttledCommands,
  regexThrottle = new RegExp("^(" + throttledCommands.join("|") + ")$", "i"),
  regexFilter = new RegExp(
    "^(" + config.filteredCommands.join("|") + ")$",
    "i"
  );

let isWindows = process.platform === "win32";

let isRunning = false; // Global variable to track running state

(function setWindowID() {
  if (!isWindows & windowID === "unfilled") {
    exec("DISPLAY=:0 xdotool search --onlyvisible --name " + config.programName, function (
      error,
      stdout
    ) {
      windowID = stdout.trim();
      // console.log(key, windowID);
    });
  }
})();

for (let i = 0; i < throttledCommands.length; i++) {
  lastTime[throttledCommands[i]] = new Date().getTime();
}

let defaultKeyMap = config.keymap || {
  up: "Up",
  left: "Left",
  down: "Down",
  right: "Right",
  a: "a",
  b: "b",
  x: "x",
  y: "y",
  start: "s",
  select: "e",
};

function sendKey(command) {
  if (command.match(regexFilter)) return;

  // Special handling for run and walk commands
  if (command === 'run') {
    isRunning = true;
    pressKey('b');
    return;
  } else if (command === 'walk') {
    isRunning = false;
    releaseKey('b');
    return;
  }

  // New code to handle repeated commands
  let [baseCommand, repeat] = command.split('x');
  repeat = parseInt(repeat) || 1;
  repeat = Math.min(repeat, 10); // Limit to 10 repetitions

  let key = defaultKeyMap[baseCommand] || baseCommand;
  
  // Throttle check moved outside the loop
  if (key.match(regexThrottle)) {
    let newTime = new Date().getTime();
    if (newTime - lastTime[key] < config.timeToWait) return;
    lastTime[key] = newTime;
  }

  for (let i = 0; i < repeat; i++) {
    pressAndReleaseKey(key);
  }
}

function pressKey(key) {
  if (!isWindows) {
    exec(`DISPLAY=:0 xdotool search --onlyvisible --sync --name "${config.programName}"`, (error, stdout) => {
      if (error) {
        console.error(`Error finding window: ${error}`);
        return;
      }
      let currentWindowID = stdout.trim();
      exec(
        `DISPLAY=:0 xdotool windowactivate ${currentWindowID} keydown --window ${currentWindowID} ${key}`,
        (error) => {
          if (error) console.error(`Error pressing key: ${error}`);
        }
      );
    });
  } else {
    exec(`python key.py ${config.programName} ${key} down`);
  }
}

function releaseKey(key) {
  if (!isWindows) {
    exec(`DISPLAY=:0 xdotool search --onlyvisible --sync --name "${config.programName}"`, (error, stdout) => {
      if (error) {
        console.error(`Error finding window: ${error}`);
        return;
      }
      let currentWindowID = stdout.trim();
      exec(
        `DISPLAY=:0 xdotool windowactivate ${currentWindowID} keyup --window ${currentWindowID} ${key}`,
        (error) => {
          if (error) console.error(`Error releasing key: ${error}`);
        }
      );
    });
  } else {
    exec(`python key.py ${config.programName} ${key} up`);
  }
}

function pressAndReleaseKey(key) {
  if (!isWindows) {
    exec(`DISPLAY=:0 xdotool search --onlyvisible --sync --name "${config.programName}"`, (error, stdout) => {
      if (error) {
        console.error(`Error finding window: ${error}`);
        return;
      }
      let currentWindowID = stdout.trim();
      exec(
        `DISPLAY=:0 xdotool windowactivate ${currentWindowID} key --window ${currentWindowID} --delay ${config.delay} ${key}`,
        (error) => {
          if (error) console.error(`Error sending key: ${error}`);
        }
      );
    });
  } else {
    exec(`python key.py ${config.programName} ${key}`);
  }
}

exports.sendKey = sendKey;
