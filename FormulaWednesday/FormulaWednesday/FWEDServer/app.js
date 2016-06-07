// A lot of the code for this came from https://auth0.com/blog/2016/03/07/hapijs-authentication-secure-your-api-with-json-web-tokens/
// Specifically mostly the code around the security bits.
// To access secured routes, an Authorization header must be set.
// ex: Authorization: Bearer <TOKEN>
'use strict';
var Hapi = require('hapi');
var Boom = require('boom');
var glob = require('glob');
var path = require('path');
var secret = require('./config');
var server = new Hapi.Server();
server.connection({ port: 33124 });
server.register(require('hapi-auth-jwt'), function (err) {
    // We're giving the strategy both a name
    // and scheme of 'jwt'
    console.log("Registering Server");
    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        verifyOptions: { algorithms: ['HS256'] }
    });
    console.log("Strat OK");
    // Look through the routes in
    // all the subdirectories of API
    // and create a new route for each
    glob.sync('/routes/*.js', {
        root: __dirname
    }).forEach(function (file) {
        console.log(file);
        var route = require(file);
        console.log(route);
        server.route(route);
    });
});
server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('server running on port 33124');
});