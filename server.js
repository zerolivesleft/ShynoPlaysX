const tmi = require("tmi.js");
const keyHandler = require("./keyHandler.js");
const config = require("./config.js");
const WebSocket = require('ws');
const { wss } = require('./webserver');

// https://github.com/tmijs/tmi.js#tmijs
// for more options
const client = new tmi.client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [config.channel],
});

const commandRegex =
  config.regexCommands ||
  new RegExp("^(" + config.commands.join("|") + ")(?:\\s*x\\s*\\d+)?$", "i");

client.on("message", function (channel, tags, message, self) {
  let isCorrectChannel = `#${config.channel}` === channel;
  let messageMatches = message.match(commandRegex);

  if (self) return;
  if (isCorrectChannel && messageMatches) {
    // print username, message, and timestamp to console
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] @${tags.username}: ${message}`);

    // send the message to the emulator
    keyHandler.sendKey(message.toLowerCase());

    // send the command to connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'command', username: tags.username, message: message }));
      }
    });
  }
});

client.addListener("connected", function (address, port) {
  console.log("Connected! Waiting for messages..");
});
client.addListener("disconnected", function (reason) {
  console.log("Disconnected from the server! Reason: " + reason);
});

client.connect();
if (config.channel === 'twitchplayspokemon') {
  console.log("");
  console.log("'twitchplayspokemon' is the default channel! Otherwise, run with the environment variable: ");
  console.log("TWITCH_CHANNEL=mychannelhere npm start");
  console.log("");
}
console.log(`Connecting to /${config.channel}..`);

module.exports = { wss };