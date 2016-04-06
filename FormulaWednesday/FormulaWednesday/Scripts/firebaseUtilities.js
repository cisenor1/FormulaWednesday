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
                        id: ko.observable(id),
                        role: ko.observable(fbUser.role),
                        points: ko.observable(fbUser.points),
                        name: ko.observable(fbUser.name),
                        editing: ko.observable(false)
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
    FirebaseUtilities.getRaces = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races");
            fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var chal = values[p];
                    chal.name = p;
                    c.push(chal);
                }
                resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getAllUsers = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users");
            fb.on("value", (function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var u = values[p];
                    var chal = {
                        id: ko.observable(p),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        name: ko.observable(u.name),
                        editing: ko.observable(false)
                    };
                    c.push(chal);
                }
                resolve(c);
            }), function (error) { (reject); });
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
    FirebaseUtilities.saveUser = function (user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.id());
            fb.set({
                name: user.name(),
                points: user.points(),
                role: user.role()
            }).then(function () { resolve(true); }).catch(function (error) { return reject(error); });
        });
    };
    FirebaseUtilities.firebaseUrl = "https://formulawednesday.firebaseio.com/";
    return FirebaseUtilities;
})();
