const { spawn } = require('child_process');
const { wss, server, PORT } = require('./webserver');

// Start the webserver
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Function to send logs to WebSocket clients
function sendLog(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 means OPEN
      client.send(JSON.stringify({ type: 'log', message }));
    }
  });
}

// Start the Twitch bot server
const botServer = spawn('node', ['server.js']);

botServer.stdout.on('data', (data) => {
  const message = `Bot server: ${data}`;
  console.log(message);
  sendLog(message);
});

botServer.stderr.on('data', (data) => {
  const message = `Bot server error: ${data}`;
  console.error(message);
  sendLog(message);
});

botServer.on('close', (code) => {
  const message = `Bot server exited with code ${code}`;
  console.log(message);
  sendLog(message);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  wss.close();
  server.close();
  botServer.kill();
  process.exit();
});