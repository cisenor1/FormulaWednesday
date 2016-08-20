/// <reference path="typings/moment/moment.d.ts" />
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
            }).then(user => {
                resolve(user);
            }).catch(reject);
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
                if (response.status != 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then((out) => {
                let outArray = JSON.parse(out);
                let users = [];
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
    static getDrivers(activeOnly) {
        return new Promise((resolve, reject) => {
            let url;
            if (activeOnly) {
                url = this.restUrl + "/drivers/active";
            }
            else {
                url = this.restUrl + "/drivers";
            }
            fetch(url, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                },
                method: "GET"
            }).then(response => {
                if (response.status != 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then(out => {
                let drivers = JSON.parse(out);
                resolve(drivers);
            }).catch(reject);
        });
    }
    static getChallengesForRace(race) {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/challenges/" + race.season.toString() + "/" + race.name;
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
                let restChallenges = JSON.parse(out);
                resolve(restChallenges);
            });
        });
    }
    static saveUserPicksForRace(race, user, userPicks) {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/challenges/" + race.season.toString() + "/" + race.name + "/" + user.key() + "/picks";
            fetch(url, {
                body: JSON.stringify(userPicks),
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                },
                method: "POST"
            }).then(response => {
                if (response.status !== 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                resolve(true);
            });
        });
    }
    static getUserPicksForRace(race, user) {
        return new Promise((resolve, reject) => {
            // challenges/{season } /{raceKey}/{userKey } /picks/{challenge key ?}
            let url = this.restUrl + "/challenges/" + race.season.toString() + "/" + race.name + "/" + user.key() + "/picks";
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
                let restUserPicks = JSON.parse(out);
                resolve(restUserPicks);
            });
        });
    }
    static getRaces(season) {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/races/" + season;
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
                let outArray = JSON.parse(out);
                let races = [];
                outArray.forEach(restRace => {
                    let raceDateMoment = moment(restRace.raceDate);
                    let cutoffMoment = moment(restRace.cutoff);
                    let race = {
                        name: restRace.key,
                        date: raceDateMoment.toDate(),
                        cutoff: cutoffMoment.toDate(),
                        title: restRace.title,
                        season: 2016,
                        city: restRace.city,
                        country: restRace.country,
                        done: ko.observable(false)
                    };
                    race.done(new Date() > race.cutoff);
                    races.push(race);
                });
                races = races.sort((r1, r2) => {
                    return r1.date.getTime() - r2.date.getTime();
                });
                resolve(races);
            }).catch(reject);
        });
    }
}
RestUtilities.restUrl = "http://192.168.0.16:32187";
