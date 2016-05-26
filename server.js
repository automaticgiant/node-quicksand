#!/usr/bin/env node

/**
 * Module dependencies.
 */

// const debug = require('debug')('quicksand');
const http = require('http');
const config = require('rc')('quicksand', {
  port: 42301,
  storeLocation: './',
  ageMax: 12*60*60*1000,
  pollFrequency: 5*1000
});
config.ageMax = eval(config.ageMax);
config.port = eval(config.port);
config.pollFrequency = eval(config.pollFrequency);

const Quicksand = new require('./index.js');
const quicksand = new Quicksand(config);
const app = quicksand.app;

app.set('port', normalizePort(config.port));
var server = http.createServer(app);
server.listen(config.port);
require('debug')('quicksand:server')('Quicksand started on port ' + config.port);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

