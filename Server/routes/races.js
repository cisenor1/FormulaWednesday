'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        handler: function (request, reply) {
            db.getRaces(request.params.season, request.params.key).then(drivers => {
                reply(drivers);
            });
        }
    }
]