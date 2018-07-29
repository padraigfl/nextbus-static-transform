/* eslint-disable */

'use strict';
var fs = require('fs');

function readJSON(directory) {
  return JSON.parse(fs.readFileSync(directory, 'utf8'));
}

function writeJSON(filename, jsonData) {
  return fs.writeFile(filename, JSON.stringify(jsonData, null, '  '), function(err) {
    if (err) throw err;
  });
}

function createDirectory(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}


module.exports = {
  readJSON: readJSON,
  writeJSON: writeJSON,
  createDirectory: createDirectory,
};
