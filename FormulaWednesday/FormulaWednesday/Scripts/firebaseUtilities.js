var FirebaseUtilities = (function () {
    function FirebaseUtilities() {
    }
    FirebaseUtilities.getUserInfo = function (credentials) {
        return new Promise(function (resolve, reject) {
            var fbCred = {
                email: credentials.name,
                password: credentials.password
            };
            var firebase = new Firebase(FirebaseUtilities.firebaseUrl);
            firebase.authWithPassword(fbCred).then(function (auth) {
                // output user
                var id = credentials.name.split('@')[0];
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + id;
                var fb = new Firebase(userUrl);
                fb.once("value").then(function (ds) {
                    var fbUser = ds.val();
                    var user = {
                        id: id,
                        email: credentials.name,
                        role: fbUser.role,
                        points: fbUser.points,
                        name: fbUser.name
                    };
                    resolve(user);
                });
            });
        });
    };
    FirebaseUtilities.getChallenges = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges");
            fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var chal = values[p];
                    chal.key = p;
                    c.push(chal);
                }
                resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getDrivers = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers");
            fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var chal = values[p];
                    chal.key = p;
                    c.push(chal);
                }
                c.sort(function (aDriver, bDriver) {
                    var aTeam = aDriver.team;
                    var bTeam = bDriver.team;
                    return aTeam.localeCompare(bTeam);
                });
                resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getTeams = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "teams");
            fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var chal = values[p];
                    chal.key = p;
                    c.push(chal);
                }
                c.sort(function (aTeam, bTeam) {
                    var aName = aTeam.name;
                    var bName = bTeam.name;
                    return aName.localeCompare(bName);
                });
                resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.firebaseUrl = "https://formulawednesday.firebaseio.com/";
    return FirebaseUtilities;
})();
//# sourceMappingURL=firebaseUtilities.js.map