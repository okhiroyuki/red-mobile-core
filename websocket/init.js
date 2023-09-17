const url = require('url');

const http = require('http');

const server = http.createServer();

const serial = require('./serial');
const ble = require('./ble');
const compass = require('./compass');
const geolocation = require('./geolocation');
const motion = require('./motion');
const gyroscope = require('./gyroscope');
const magnetic = require('./magnetic');
const light = require('./light');
const proximity = require('./proximity');
const nfc = require('./nfc');
const fcm = require('./fcm');
const firebaseToken = require('./firebaseToken');

const wsSerial = serial.getWss();
const wsBle = ble.getWss();
const wsCompass = compass.getWss();
const wsGeolocation = geolocation.getWss();
const wsMotion = motion.getWss();
const wsGyroscope = gyroscope.getWss();
const wsMagnetic = magnetic.getWss();
const wsLight = light.getWss();
const wsPromixity = proximity.getWss();
const wsNFC = nfc.getWss();
const wsFcm = fcm.getWss();
const wsFirebaseToken = firebaseToken.getWss();

server.on('upgrade', (request, socket, head) => {
  const { pathname } = url.parse(request.url);
  console.log(`wsServer upgrade pathname: ${pathname}`);

  if (pathname === '/mobile/serial') {
    if (wsSerial) {
      wsSerial.handleUpgrade(request, socket, head, (ws) => {
        wsSerial.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/ble') {
    if (wsBle) {
      wsBle.handleUpgrade(request, socket, head, (ws) => {
        wsBle.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/compass') {
    if (wsCompass) {
      wsCompass.handleUpgrade(request, socket, head, (ws) => {
        wsCompass.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/geolocation') {
    if (wsGeolocation) {
      wsGeolocation.handleUpgrade(request, socket, head, (ws) => {
        wsGeolocation.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/motion') {
    if (wsMotion) {
      wsMotion.handleUpgrade(request, socket, head, (ws) => {
        wsMotion.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/gyroscope') {
    if (wsGyroscope) {
      wsGyroscope.handleUpgrade(request, socket, head, (ws) => {
        wsGyroscope.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/magnetic') {
    if (wsMagnetic) {
      wsMagnetic.handleUpgrade(request, socket, head, (ws) => {
        wsMagnetic.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/light') {
    if (wsLight) {
      wsLight.handleUpgrade(request, socket, head, (ws) => {
        wsLight.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/proximity') {
    if (wsPromixity) {
      wsPromixity.handleUpgrade(request, socket, head, (ws) => {
        wsPromixity.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/mobile/nfc') {
    if (wsNFC) {
      wsNFC.handleUpgrade(request, socket, head, (ws) => {
        wsNFC.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/firebase/message') {
    if (wsFcm) {
      wsFcm.handleUpgrade(request, socket, head, (ws) => {
        wsFcm.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else if (pathname === '/firebase/refresh') {
    if (wsFirebaseToken) {
      wsFirebaseToken.handleUpgrade(request, socket, head, (ws) => {
        wsFirebaseToken.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } else {
    socket.destroy();
  }
});

function listen(port) {
  console.log(`wsServer listen port: ${port}`);
  server.listen(port);
}

module.exports = {
  listen,
  sendBle: (messege) => {
    ble.send(messege);
  },
  sendSerial: (message) => {
    serial.send(message);
  },
  sendCompass: (message) => {
    compass.send(message);
  },
  sendMotion: (message) => {
    motion.send(message);
  },
  sendGeolocation: (message) => {
    geolocation.send(message);
  },
  sendGyroscope: (message) => {
    gyroscope.send(message);
  },
  sendMagnetic: (message) => {
    magnetic.send(message);
  },
  sendLight: (message) => {
    light.send(message);
  },
  sendProximity: (message) => {
    proximity.send(message);
  },
  sendNFC: (message) => {
    nfc.send(message);
  },
  sendFCM: (message) => {
    fcm.send(message);
  },
  sendFirebaseToken: (message) => {
    firebaseToken.send(message);
  },
};
