'use strict';

const Boom = require('boom');
const bcrypt = require('bcrypt');
const db = require('./sqliteUtilities');

function verifyUniqueUser(req, res) {
    // Find an entry from the database that
    // matches the email
    db.getUsers(req.payload.email).then(users => {
        if (users && users.length > 0) {
            var user = users[0];
            if (user) {
                if (user.email === req.payload.email) {
                    res(Boom.badRequest('Email taken'));
                    return;
                }
            }
        }
        // If everything checks out, send the payload through
        // to the route handler
        res(req.payload);
    });
}

function verifyCredentials(req, res) {

    const password = req.payload.password;

    // Find an entry from the database that
    // matches either the email or username
    db.getUsers(req.payload.email, true).then(users => {
        if (users && users.length > 0) {
            var user = users[0];
            console.log(user);
            if (user) {
                bcrypt.compare(password, user.pass, (err, isValid) => {
                    if (isValid) {
                        user.password = null;
                        res(user);
                        return;
                    }
                    else {
                        res(Boom.badRequest('Incorrect password!'));
                        return;
                    }
                });
            }
            else {
                res(Boom.badRequest('Incorrect username or email!'));
            }
        }
        else {
            res(Boom.badRequest('Incorrect username or email!'));
        }
    });
}

module.exports = {
    verifyUniqueUser: verifyUniqueUser,
    verifyCredentials: verifyCredentials
}