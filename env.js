const fs = require('fs');
const path = require('path');

let envPath;

function init(cordova) {
  envPath = path.join(cordova.app.datadir(), 'env');
}

module.exports = {
  init,
  set: () => {
    fs.access(envPath, fs.constants.R_OK || fs.constants.W_OK, (error) => {
      if (error) {
        console.log(error);
        return;
      }
      // eslint-disable-next-line global-require
      require('dotenv').config({ path: envPath });
      console.log(process.env);
    });
  },
};
