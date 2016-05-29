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
        
    }
]