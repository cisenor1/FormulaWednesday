'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    { 
        method: 'GET', 
        path: '/challenges/{season}/{key?}',
        config: {
            handler: function (request, reply) {
                db.getChallenges(request.params.season, request.params.key).then(challenges => {
                    reply(challenges); 
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
        path: '/challenges/{season}/{raceKey}/{userKey}/picks/{key?}',
        config: {
            handler: function (request, reply) {
                let credentials = request.auth.credentials;
                if (request.params.userKey !== credentials.key)
                {
                    throw Boom.badRequest(new Error("cannot request picks for different user"));
                }
                db.getUserPicks(request.params.userKey, request.params.season, request.params.raceKey, request.params.key).then(picks => {
                    reply(picks);
                });
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    }
]