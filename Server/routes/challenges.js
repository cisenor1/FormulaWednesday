'use strict';

var db = require('../data/sqliteUtilities');

module.exports = [
    { 
        method: 'GET', 
        path: '/challenges/{season}/{key?}', 
        handler: function (request, reply) {
            db.getChallenges(request.params.season, request.params.key).then(challenges => {
                reply(challenges); 
            });
        }
    }
]