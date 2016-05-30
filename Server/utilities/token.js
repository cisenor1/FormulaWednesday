'use strict';

const jwt = require('jsonwebtoken');
const secret = require('../config');

function createToken(user) {
  let scopes;
  // Check if the user object passed in
  // has admin set to true, and if so, set
  // scopes to admin
  if (user.role === "admin") {
    scopes = ['admin', 'user'];
  }
  else {
      scopes = ['user'];
  }
  // Sign the JWT
  return jwt.sign({ key: user.key, email: user.email, scope: scopes }, secret, { algorithm: 'HS256', expiresIn: "1h" } );
}

module.exports = createToken;