'use strict';

const bcrypt = require('bcrypt');
const Boom = require('boom');
const base64url = require('base64-url');
const User = require('../models/user');
const createUserSchema = require('../utilities/createUser');
const verifyUniqueUser = require('../utilities/userFunctions').verifyUniqueUser;
const verifyCredentials = require('../utilities/userFunctions').verifyCredentials;
const authenticateUserSchema = require('../utilities/authenticateUserSchema');
const createToken = require('../utilities/token').createToken;
const checkAndDecodeToken = require('../utilities/token').checkAndDecodeToken;
const db = require('../utilities/sqliteUtilities');

function hashPassword(password, cb) {
  // Generate a salt at level 10 strength
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      return cb(err, hash);
    });
  });
}

module.exports = [
    {
        method: 'POST',
        path: '/users',
        config: {
            // Before the route handler runs, verify that
            // the user is unique and assign the result to 'user'
            pre: [
            { method: verifyUniqueUser, assign: 'user' }
            ],
            handler: (req, res) => {
                let user = new User();
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
                user.key = base64url.encode(user.email);
                user.firstName = req.payload.firstName;
                user.lastName = req.payload.lastName;
                hashPassword(req.payload.password, (err, hash) => {
                    if (err) {
                        throw Boom.badRequest(err);
                    }
                    user.password = hash;
                    db.saveUser(user).then(success => {
                        if (success) {
                            res({ 
                                id_token: createToken(user),
                                key: user.key
                             }).code(201);
                        }
                        else {
                            throw Boom.badRequest(new Error("unable to save user"));
                        }
                        
                    }).catch(error => {
                        throw Boom.badRequest(error);
                    });
                });
            },
            // Validate the payload against the Joi schema
            validate: {
                payload: createUserSchema
            }
        }
    },
    {
        method: 'POST',
        path: '/users/authenticate',
        config: {
            // Check the user's password against the DB
            pre: [
            { 
                method: verifyCredentials, assign: 'user' 
            }],
            handler: (req, res) => {
                // If the user's password is correct, we can issue a token.
                // If it was incorrect, the error will bubble up from the pre method
                res({ 
                    id_token: createToken(req.pre.user),
                    key: req.pre.user.key
                 }).code(200);
            },
            validate: {
                payload: authenticateUserSchema
            }
        }
    },
    {
        method: 'GET',
        path: '/users/fullinfo',
        config: {
            handler: (req, res) => {
                db.getUsers(null, false).then(users => {
                    res(users);
                });
            },
            // Add authentication to this route
            // The user must have a scope of `admin`
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            }
        }
    },
    {
        method: 'GET',
        path: '/users/basicinfo',
        config: {
            handler: (req, res) => {
                db.getBasicUsers(null, false).then(users => {
                    res(users);
                });
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{key}',
        config: {
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                if (req.params.key !== credentials.key)
                {
                    throw Boom.badRequest(new Error("cannot request info for different user"));
                }
                db.getUsers(credentials.email, false).then(users => {
                    if (!users) {
                        throw Boom.badRequest(new Error("user information could not be found"));
                    }
                    var user = users[0];
                    if (!user)
                    {
                        throw Boom.badRequest(new Error("user information could not be found"));
                    }
                    res(user);
                });
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    }
]