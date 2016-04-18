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
                var key = FormulaWednesdaysUtilities.getKeyFromEmail(fbCred.email);
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + key;
                var fb = new Firebase(userUrl);
                fb.once("value").then(function (ds) {
                    var fbUser = ds.val();
                    var user = {
                        key: ko.observable(key),
                        role: ko.observable(fbUser.role),
                        points: ko.observable(fbUser.points),
                        username: ko.observable(fbUser.username),
                        fullname: ko.observable(fbUser.fullname),
                        editing: ko.observable(false),
                        email: ko.observable(fbUser.email)
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
                    var fbChal = values[p];
                    var chal = {
                        choice: ko.observable(fbChal.choice),
                        description: ko.observable(fbChal.description),
                        key: ko.observable(fbChal.key),
                        allSeason: ko.observable(fbChal.allSeason),
                        message: ko.observable(fbChal.message),
                        value: ko.observable(fbChal.value),
                        editing: ko.observable(false),
                        type: ko.observable(fbChal.type)
                    };
                    chal.key = ko.observable(p);
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
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + user.key() + "/results/2016");
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
                        key: ko.observable(u.key),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        fullname: ko.observable(u.fullname),
                        username: ko.observable(u.username),
                        editing: ko.observable(false),
                        email: ko.observable(u.email)
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
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.key());
            fb.set({
                username: user.username(),
                fullname: user.fullname(),
                points: user.points(),
                role: user.role(),
                email: user.email()
            }).then(function () { resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.saveChallengeChoices = function (user, race, challenges) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.key() + "/results/2016/" + race.name);
            fb.set(challenges).then(function () { resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.createUser = function (user, hashedPassword) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl);
            var fbCred = {
                email: user.email(),
                password: hashedPassword
            };
            fb.createUser(fbCred, function (error, userData) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(userData);
            });
        });
    };
    FirebaseUtilities.changePassword = function (user, oldPassword, newPassword) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl);
            var fbCred = {
                email: user.email(),
                oldPassword: oldPassword,
                newPassword: newPassword
            };
            fb.changePassword(fbCred, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    };
    FirebaseUtilities.changeUsername = function (user, newUsername) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "/users/" + user.key() + "/username");
            fb.set(newUsername, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    };
    FirebaseUtilities.addNewUser = function (user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var email = user.email();
            var processedEmail = FormulaWednesdaysUtilities.getKeyFromEmail(email);
            var fb = new Firebase(_this.firebaseUrl + "users/" + processedEmail);
            var newUser = {
                "username": user.username(),
                "fullname": user.fullname(),
                "points": 0,
                "email": user.email(),
                "role": user.role(),
                "key": processedEmail
            };
            fb.set(newUser).then(function () { resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.firebaseUrl = "https://formulawednesday.firebaseio.com/";
    return FirebaseUtilities;
})();
//# sourceMappingURL=firebaseUtilities.js.map