const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const path = require("path");

const server = http.createServer((req, res) => {
  const filePath = path.join(
    __dirname,
    "dist",
    req.url === "/" ? "index.html" : req.url
  );
  const extname = path.extname(filePath);
  const contentType =
    {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
    }[extname] || "text/plain";
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end(`Server error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  console.log(`Total connected clients: ${wss.clients.size}`);

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    console.log(`Total connected clients: ${wss.clients.size}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Send a test message
  ws.send(
    JSON.stringify({
      type: "log",
      message: "WebSocket connection established from server",
    })
  );
  ws.send(
    JSON.stringify({
      type: "command",
      message: "WebSocket connection established from server",
    })
  );
});

const PORT = process.env.PORT || 3002;

module.exports = { wss, server, PORT };
