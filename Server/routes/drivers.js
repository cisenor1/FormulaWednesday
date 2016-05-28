'use strict';

var db = require('../data/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        handler: function (request, reply) {
            db.getDrivers(request.params.key).then(drivers => {
                reply(drivers);
            });
        }
    }
]