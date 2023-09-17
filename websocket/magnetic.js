const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });
let ws;

wss.on("connection", (w) => {
  console.log("WebSocketServer: connection");
  ws = w;
});

wss.on("message", (message) => {
  console.log("WebSocketServer: message : %s", message);
});

wss.on("error", (e) => {
  console.log("WebSocketServer: error : %s", e);
});

wss.on("close", () => {
  console.log("WebSocketServer: closed");
});

function send(message) {
  if (ws) {
    ws.send(JSON.stringify(message));
  }
}

function getWss() {
  return wss;
}

module.exports = {
  send,
  getWss,
};
