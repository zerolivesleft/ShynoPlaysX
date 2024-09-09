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

(function setWindowID() {
  if (!isWindows & windowID === "unfilled") {
    exec("xdotool search --onlyvisible --name " + config.programName, function (
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

  let key = defaultKeyMap[command] || command;
  if (key.match(regexThrottle)) {
    let newTime = new Date().getTime();
    if (newTime - lastTime[key] < config.timeToWait) return;
    lastTime[key] = newTime;
  }

  if (!isWindows) {
    exec(`xdotool search --onlyvisible --sync --name "${config.programName}"`, (error, stdout) => {
      if (error) {
        console.error(`Error finding window: ${error}`);
        return;
      }
      let currentWindowID = stdout.trim();
      exec(
        `xdotool windowactivate ${currentWindowID} key --window ${currentWindowID} --delay ${config.delay} ${key}`,
        (error) => {
          if (error) console.error(`Error sending key: ${error}`);
        }
      );
    });
  } else {
    // Windows code remains the same
    exec(`python key.py ${config.programName} ${key}`);
  }
}

exports.sendKey = sendKey;
