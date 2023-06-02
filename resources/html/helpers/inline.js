'use strict';

const fs = require('fs');

module.exports = function (filename) {
  return fs.readFileSync(filename, 'utf-8');
};
