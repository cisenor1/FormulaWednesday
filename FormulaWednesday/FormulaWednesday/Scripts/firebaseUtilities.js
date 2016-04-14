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
                    chal.choice = ko.observable("");
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
                    var driver = values[p];
                    driver.key = p;
                    c.push(driver);
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
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/2016");
            fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var race = values[p];
                    race.name = p;
                    race.date = new Date(race.date);
                    race.cutoff = new Date(race.cutoff);
                    race.done = ko.observable(new Date() > race.cutoff);
                    c.push(race);
                }
                c = c.sort(function (r1, r2) {
                    return r1.date.getTime() - r2.date.getTime();
                });
                resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getUserChoices = function (user) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + user.id() + "/results/2016");
            fb.once("value").then(function (ds) {
                resolve(ds.val());
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
                    var user = {
                        id: ko.observable(p),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        name: ko.observable(u.name),
                        editing: ko.observable(false)
                    };
                    c.push(user);
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
                    var team = values[p];
                    team.key = p;
                    c.push(team);
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
            }).then(function () { resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.saveChallengeChoices = function (user, race, challenges) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.id() + "/results/2016/" + race.name);
            fb.set(challenges).then(function () { resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.firebaseUrl = "https://formulawednesday.firebaseio.com/";
    return FirebaseUtilities;
})();
//# sourceMappingURL=firebaseUtilities.js.map