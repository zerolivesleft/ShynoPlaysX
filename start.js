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
      try {
        client.send(JSON.stringify({ type: 'log', message }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  });
}

// WebSocket server error handling
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

wss.on('connection', (ws, req) => {
  console.log(`New WebSocket connection from ${req.socket.remoteAddress}`);
  
  ws.on('error', (error) => {
    console.error('WebSocket client error:', error);
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed: ${code} ${reason}`);
  });

  // Send a test message
  ws.send(JSON.stringify({ type: 'log', message: 'WebSocket connection established' }));
});

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