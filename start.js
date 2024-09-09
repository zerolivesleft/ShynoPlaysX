const { spawn } = require('child_process');
const { wss } = require('./webserver');

// Start the webserver
require('./webserver');

// Start the Twitch bot server
const botServer = spawn('node', ['server.js']);

botServer.stdout.on('data', (data) => {
  console.log(`Bot server: ${data}`);
});

botServer.stderr.on('data', (data) => {
  console.error(`Bot server error: ${data}`);
});

botServer.on('close', (code) => {
  console.log(`Bot server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  wss.close();
  botServer.kill();
  process.exit();
});