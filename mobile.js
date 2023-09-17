const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const { EventEmitter } = require('events');

const ev = new EventEmitter();
let accessKey;
let cordova;

function init(_cordova) {
  accessKey = uuidv4();
  cordova = _cordova;
}

function enableHost(req) {
  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.replace('Bearer: ', '');
    return bcryptjs.compare(accessKey, token);
  }
  return false;
}

function sendResponse(res, status, data) {
  if (status) {
    res.status(200).json(data);
  } else {
    res.status(500).send(data);
  }
}

function callback(msg) {
  ev.emit(msg.id, msg.status, msg.payload);
}

function responseGet(req, res) {
  if (req.query.method !== undefined && enableHost(req)) {
    const msg = {
      id: req.query.id,
      method: req.query.method,
    };
    cordova.channel.send(JSON.stringify(msg));
    ev.once(msg.id, (status, data) => {
      sendResponse(res, status, data);
    });
  } else {
    res.status(404).send();
  }
}

function responsePost(req, res) {
  if (req.body.method && enableHost(req)) {
    const msg = req.body;
    cordova.channel.send(JSON.stringify(msg));
    ev.once(msg.id, (status, data) => {
      sendResponse(res, status, data);
    });
  } else {
    res.status(404).send();
  }
}

function getBcrytKey() {
  return bcryptjs.hashSync(accessKey, 8);
}

module.exports = {
  init,
  callback,
  getBcryptKey: getBcrytKey,
  responsePost,
  responseGet,
};
