'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const glob = require('glob');
const path = require('path');
const secret = require('./config');

const server = new Hapi.Server();

server.connection({ port: 3000 });

server.register(require('hapi-auth-jwt'), (err) => {
  // We're giving the strategy both a name
  // and scheme of 'jwt'
  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    verifyOptions: { algorithms: ['HS256'] }
  });

  // Look through the routes in
  // all the subdirectories of API
  // and create a new route for each
  glob.sync('./routes/*.js', {
    root: __dirname
  }).forEach(file => {
    const route = require(path.join(__dirname, file));
    console.log(route);
    server.route(route);
  });
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('server running on port 3000');
});