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
            return firebase.authWithPassword(fbCred).then(function (auth) {
                // output user
                var key = FormulaWednesdaysUtilities.getKeyFromEmail(fbCred.email);
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + key;
                var fb = new Firebase(userUrl);
                return fb.once("value").then(function (ds) {
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
                    if (fbUser.results) {
                        user.results = fbUser.results;
                    }
                    return resolve(user);
                });
            }).catch(reject);
        });
    };
    FirebaseUtilities.getChallengeByKey = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges/" + key);
            return fb.once("value").then(function (ds) {
                var fbChal = ds.val();
                if (!fbChal) {
                    return resolve(null);
                }
                _this.getDrivers().then(function (d) {
                    var chal = {
                        choice: ko.observable(fbChal.choice),
                        description: ko.observable(fbChal.description),
                        key: ko.observable(key),
                        allSeason: ko.observable(fbChal.allSeason),
                        message: ko.observable(fbChal.message),
                        value: ko.observable(fbChal.value),
                        editing: ko.observable(false),
                        type: ko.observable(fbChal.type),
                        drivers: ko.observableArray(d)
                    };
                    return resolve(chal);
                });
            });
        });
    };
    FirebaseUtilities.getChallengesForRace = function (race) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/" + race.season + "/" + race.name + "/selectedChallenges");
            return fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                var promises = [];
                for (var p in values) {
                    if (typeof values[p] === "string") {
                        promises.push(FirebaseUtilities.getChallengeByKey(values[p]));
                    }
                    else {
                        promises.push(FirebaseUtilities.getBestOfTheWorstCandidates(values[p]));
                    }
                }
                if (promises.length) {
                    Promise.all(promises).then(function (values) {
                        values.forEach(function (x) {
                            if (x.length) {
                                // it's a driver array
                                var drivers = x;
                                var chal = {
                                    description: ko.observable("Of the slowest drivers, who will finish highest."),
                                    allSeason: ko.observable(false),
                                    choice: ko.observable(null),
                                    editing: ko.observable(false),
                                    key: ko.observable("bestofworst"),
                                    message: ko.observable("Best of the Worst"),
                                    type: ko.observable("driver"),
                                    value: ko.observable(5),
                                    drivers: ko.observableArray(drivers)
                                };
                                c.push(chal);
                            }
                            else {
                                // it's a challenge
                                c.push(x);
                            }
                            return resolve(c);
                        });
                    }).catch(function (e) { debugger; });
                }
            }).catch(reject);
        });
    };
    FirebaseUtilities.getBestOfTheWorstCandidates = function (names) {
        return new Promise(function (resolve, reject) {
            Promise.map(names, function (name, index, array) {
                return FirebaseUtilities.getDriverByName(name);
            }).then(function (values) {
                return resolve(values);
            });
        });
    };
    FirebaseUtilities.getChallenges = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges");
            return fb.once("value").then(function (ds) {
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
                        type: ko.observable(fbChal.type),
                        drivers: ko.observableArray([])
                    };
                    chal.key = ko.observable(p);
                    c.push(chal);
                }
                return resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getDriverByName = function (key) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers/" + key);
            return fb.once("value").then(function (ds) {
                var driver = ds.val();
                driver.key = key;
                return resolve(driver);
            });
        });
    };
    FirebaseUtilities.getDrivers = function (getInactive) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers");
            return fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var driver = values[p];
                    driver.key = p;
                    if (driver.active || getInactive) {
                        c.push(driver);
                    }
                }
                c.sort(function (aDriver, bDriver) {
                    var aTeam = aDriver.team;
                    var bTeam = bDriver.team;
                    return aTeam.localeCompare(bTeam);
                });
                return resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getRaces = function (season) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/" + season);
            return fb.once("value").then(function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var race = values[p];
                    race.scored = ko.observable(!!values[p]["scored"]);
                    race.name = p;
                    race.date = new Date(race.date);
                    race.cutoff = new Date(race.cutoff);
                    race.done = ko.observable(new Date() > race.cutoff);
                    c.push(race);
                }
                Promise.map(c, function (r, i, l) {
                    _this.getChallengesForRace(r).then(function (chal) {
                        r.challenges = ko.observableArray(chal);
                    });
                });
                c = c.sort(function (r1, r2) {
                    return r1.date.getTime() - r2.date.getTime();
                });
                return resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.getUserChoices = function (user) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + user.key() + "/results/2016");
            return fb.once("value").then(function (ds) {
                return resolve(ds.val());
            }).catch(reject);
        });
    };
    FirebaseUtilities.getAllUsers = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users");
            return fb.on("value", (function (ds) {
                var values = ds.val();
                var c = [];
                for (var p in values) {
                    var u = values[p];
                    var user = {
                        key: ko.observable(u.key),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        fullname: ko.observable(u.fullname),
                        results: u.results || {},
                        username: ko.observable(u.username),
                        editing: ko.observable(false),
                        email: ko.observable(u.email)
                    };
                    c.push(user);
                }
                return resolve(c);
            }), function (error) { (reject); });
        });
    };
    FirebaseUtilities.getTeams = function () {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "teams");
            return fb.once("value").then(function (ds) {
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
                return resolve(c);
            }).catch(reject);
        });
    };
    FirebaseUtilities.saveUser = function (user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.key());
            return fb.set({
                username: user.username(),
                fullname: user.fullname(),
                points: user.points(),
                role: user.role(),
                email: user.email()
            }).then(function () { return resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.saveChallengeChoices = function (user, race, challenges) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "users/" + user.key() + "/results/2016/" + race.name);
            return fb.set(challenges).then(function () { return resolve(true); }).catch(reject);
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
            return fb.createUser(fbCred, function (error, userData) {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(userData);
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
            return fb.changePassword(fbCred, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(true);
            });
        });
    };
    FirebaseUtilities.changeUsername = function (user, newUsername) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "/users/" + user.key() + "/username");
            return fb.set(newUsername, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(true);
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
            return fb.set(newUser).then(function () { return resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.getUserByKey = function (key) {
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + key);
            return fb.once("value").then(function (ds) {
                var value = ds.val();
                var userData = {
                    editing: ko.observable(false),
                    email: ko.observable(value["email"]),
                    fullname: ko.observable(value["fullname"]),
                    points: ko.observable(value["points"]),
                    key: ko.observable(key),
                    role: ko.observable(value["role"]),
                    username: ko.observable(value["username"])
                };
                return resolve(userData);
            });
        });
    };
    FirebaseUtilities.addNewBlogPost = function (post) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var by = post.user.key();
            var title = post.title;
            var time = post.timestamp;
            var message = post.message;
            message = FirebaseUtilities.escape(message);
            var fb = new Firebase(_this.firebaseUrl + "blogPosts/" + time + by);
            var newPost = {
                "title": title,
                "user": by,
                "message": message,
                "timestamp": time
            };
            return fb.set(newPost).then(function () { return resolve(true); }).catch(reject);
        });
    };
    FirebaseUtilities.getBlogPosts = function (count) {
        if (!count) {
            count = 5;
        }
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "blogPosts");
            return fb.once("value").then(function (ds) {
                var values = ds.val();
                var blog = [];
                var promises = [];
                for (var p in values) {
                    var b = values[p];
                    var key = b["user"];
                    b.message = FirebaseUtilities.unescape(b.message);
                    promises.push(key);
                    blog.push(b);
                }
                return Promise.all(blog.map(function (blog, i, a) {
                    return FirebaseUtilities.getUserByKey(blog.user).then(function (u) {
                        blog.user = u;
                    });
                })).then(function (us) {
                    blog.sort(function (aB, bB) {
                        var aTime = +aB.timestamp;
                        var bTime = +bB.timestamp;
                        return bTime - aTime;
                    });
                    blog.forEach(function (b) {
                        b.timestamp = new Date(+b.timestamp).toLocaleDateString();
                    });
                    if (blog.length >= count) {
                        blog = blog.splice(0, count);
                    }
                    return resolve(blog);
                });
            }).catch(reject);
        });
    };
    FirebaseUtilities.escape = function (inString) {
        var enc = encodeURIComponent(inString);
        var rep = enc.replace(/\./g, "%2E");
        return rep;
    };
    FirebaseUtilities.unescape = function (inString) {
        return decodeURIComponent(inString);
    };
    FirebaseUtilities.setRaceResults = function (race) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fb = new Firebase(_this.firebaseUrl + "races/" + race.season + "/" + race.name + "/results");
            return fb.set(race.results).then(function () {
                fb = new Firebase(_this.firebaseUrl + "races/" + race.season + "/" + race.name + "/scored");
                return fb.set(true).then(function () {
                    return resolve(race);
                });
            }).catch(reject);
        });
    };
    FirebaseUtilities.setPoints = function (user) {
        var url = this.firebaseUrl + "users/" + user.key() + "/points";
        var fb = new Firebase(url);
        return fb.set(user.points());
    };
    FirebaseUtilities.setDriverPoints = function (drivers) {
        var _this = this;
        drivers.forEach(function (x) {
            var url = _this.firebaseUrl + "drivers/" + x.key + "/points";
            var fb = new Firebase(url);
            fb.set(+x.points);
            url = _this.firebaseUrl + "drivers/" + x.key + "/wins";
            fb = new Firebase(url);
            fb.set(+x.wins);
        });
    };
    FirebaseUtilities.firebaseUrl = "https://formulawednesday.firebaseio.com/";
    return FirebaseUtilities;
})();
