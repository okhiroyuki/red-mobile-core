const fse = require('fs-extra');
const axios = require('axios');
const qs = require('qs');
const { EventEmitter } = require('events');

const ev = new EventEmitter();

const BASE_URL = 'http://127.0.0.1';

let user;
let pass;
let port;

function init(_user, _pass, _port) {
  user = _user;
  pass = _pass;
  port = _port;
}

function sendResponse(res, err) {
  if (err) {
    res.status(500).send();
  } else {
    res.status(200).send();
  }
}

function uploadCallback(err) {
  ev.emit('upload', err);
}

function clear(dir) {
  fse.emptyDir(dir, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('clear success');
    }
  });
}

function updateFlows(_data, _token) {
  const config = {
    baseURL: `${BASE_URL}:${port}`,
    url: '/red/flows',
    method: 'post',
    data: _data,
    timeout: 60000,
  };

  if (_token !== undefined) {
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_token}`,
    };
  } else {
    config.headers = {
      'Content-Type': 'application/json',
    };
  }

  // eslint-disable-next-line no-unused-vars
  axios.request(config).then((res) => {
    uploadCallback();
  }).catch((error) => {
    uploadCallback(error);
  });
}

function getToken(data) {
  const json = {
    client_id: 'node-red-admin',
    grant_type: 'password',
    scope: '*',
    username: user,
    password: pass,
  };
  const config = {
    baseURL: `${BASE_URL}:${port}`,
    url: '/red/auth/token',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(json),
    timeout: 5000,
  };

  axios.request(config).then((res) => {
    updateFlows(data, res.data.access_token);
  }).catch((error) => {
    uploadCallback(error);
  });
}

function upload(req, res) {
  const data = JSON.parse(req.body.data);
  ev.once('upload', (status) => {
    sendResponse(res, status);
  });
  if (user !== undefined && pass !== undefined) {
    getToken(data);
  } else {
    updateFlows(data);
  }
}

module.exports = {
  init,
  upload,
  clear,
};
