class RestUtilities {
    static logIn(email, password) {
        return new Promise((resolve, reject) => {
            fetch(this.restUrl + "/users/authenticate", {
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                method: 'POST'
            }).then((response) => {
                return response.text();
            }).then((output) => {
                this.auth = JSON.parse(output);
                return this.getUser(this.auth.key, this.auth.id_token);
            }).then(resolve).catch(reject);
        });
    }
    static getUser(key, token) {
        return new Promise((resolve, reject) => {
            fetch(this.restUrl + "/users/" + this.auth.key, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                }
            }).then((response) => {
                return response.text();
            }).then((output) => {
                var ret = JSON.parse(output);
                var outUser = {
                    displayName: ko.observable(ret.displayName),
                    email: ko.observable(ret.email),
                    firstName: ko.observable(ret.firstName),
                    lastName: ko.observable(ret.lastName),
                    key: ko.observable(ret.key),
                    points: ko.observable(ret.points || 0),
                    role: ko.observable(ret.role),
                    editing: ko.observable(false)
                };
                resolve(outUser);
            });
        });
    }
    static getAllUsers() {
        return new Promise((resolve, reject) => {
            if (!this.auth || !this.auth.id_token) {
                reject(new Error("No token supplied"));
            }
            fetch(this.restUrl + "/users", {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                },
                method: "GET"
            }).then((response) => {
                return response.text();
            }).then((out) => {
                if (JSON.parse(out).statusCode !== 200) {
                    return reject(JSON.parse(out).message);
                }
                var outArray = JSON.parse(out);
                var users = [];
                outArray.forEach((x) => {
                    var user = {
                        displayName: ko.observable(x.displayName),
                        firstName: ko.observable(x.firstName),
                        lastName: ko.observable(x.lastName),
                        email: ko.observable(x.email),
                        key: ko.observable(x.key),
                        role: ko.observable(x.role),
                        points: ko.observable(x.points || 0),
                        editing: ko.observable(false)
                    };
                    users.push(user);
                });
                resolve(users);
            }).catch(reject);
        });
    }
    static getChallengesForRace(race) {
        return new Promise((resolve, reject) => {
            debugger;
            var url = this.restUrl + "/races/" + race.season.toString() + "/" + race.name;
            fetch(url, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                },
                method: "GET"
            }).then(response => {
                if (response.status !== 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then(out => {
                var outArray = JSON.parse(out);
            });
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/" + race.season + "/" + race.name + "/selectedChallenges");
            return fb.once("value").then((ds) => {
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
                    Promise.all(promises).then((values) => {
                        values.forEach((x) => {
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
                    }).catch((e) => { debugger; });
                }
            }).catch(reject);
        });
    }
    static getRaces(season) {
        return new Promise((resolve, reject) => {
            var url = this.restUrl + "/races/" + season;
            fetch(url, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                },
                method: "GET"
            }).then(response => {
                if (response.status !== 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then(out => {
                var outArray = JSON.parse(out);
                var races = [];
                outArray.forEach(restRace => {
                    var race = {
                        name: restRace.key,
                        date: new Date(Date.parse(restRace.raceDate)),
                        cutoff: new Date(Date.parse(restRace.cutoff)),
                        title: restRace.title,
                        season: 2016,
                        city: restRace.city,
                        country: restRace.country,
                        done: ko.observable(false)
                    };
                    races.push(race);
                });
                //Promise.map(races, (r, i, l) => {
                //    this.getChallengesForRace(r).then((chal) => {
                //        r.challenges = ko.observableArray(chal);
                //    });
                //});
                races = races.sort((r1, r2) => {
                    return r1.date.getTime() - r2.date.getTime();
                });
                resolve(races);
                return;
            }).catch(reject);
        });
    }
}
RestUtilities.restUrl = "http://192.168.215.1:32187";
