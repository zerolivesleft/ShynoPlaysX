// change these two variables
let channel = process.env.TWITCH_CHANNEL || "theonlyshyno";
let programName =
  process.env.CONFIG_PROGRAM_NAME || "mgba";
  
// List of commands to check for
let commands = [
  "left",
  "right",
  "up",
  "down",
  "start",
  "select",
  "a",
  "b",
  "l",
  "r",
  "run",
  "walk",
];

// Add support for multiple inputs
// let multipleInputs = commands.map(cmd => `${cmd}x\\d+`);
// commands = commands.concat(multipleInputs);

let filteredCommands = [];
let throttledCommands = [];

module.exports = {
  // all commands to print out
  commands,
  // twitch channel to connect to
  channel,
  // Title of the window of the program (ex: 'Desmume' or 'VBA')
  programName,

  // If you need to filter the commands sent to the program
  // Ex: democracy/anarchy since they don't affect the program itself
  // Ex: ["democracy","anarchy"]
  filteredCommands,

  // If you want to prevent people from using from command too often
  // Ex: ["start"]
  throttledCommands,

  // Throttle time in seconds
  // Ex: you can limit 'start' so it's only used every 10 sec
  timeToWait: 10000,

  // Delay between each possible keypress in milliseconds (can't be too fast)
  // To change on Windows, change `key.py`
  delay: 100,

  // Delay between repeated commands in milliseconds
  repeatDelay: 200,
};