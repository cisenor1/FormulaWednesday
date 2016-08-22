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
                return this.getUser(this.auth.key);
            }).then(user => {
                resolve(user);
            }).catch(reject);
        });
    }
    static updateUserPassword(user, newPassword) {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/users/" + user.key() + "/updatePassword";
            let payload = {
                newPassword: newPassword
            };
            fetch(url, {
                headers: {
                    'Authorization': "Bearer " + this.auth.id_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                method: 'PUT'
            }).then(response => {
                if (response.status != 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then(out => {
                resolve(true);
            }).catch(reject);
        });
    }
    static createUser(user) {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/users";
            fetch(url, {
                headers: {
                    'Authorization': "Bearer " + this.auth.id_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                method: 'POST'
            }).then(response => {
                if (response.status != 201) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.json();
            }).then((out) => {
                return this.getUser(out.key);
            }).then((newUser) => {
                resolve(newUser);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    static updateUserInfo(user) {
        return new Promise((resolve, reject) => {
            if (!user.key) {
                reject(new Error("need key to update user"));
                return;
            }
            let url = this.restUrl + "/users/" + user.key;
            fetch(url, {
                headers: {
                    'Authorization': "Bearer " + this.auth.id_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                method: 'PUT'
            }).then(response => {
                if (response.status != 200) {
                    reject(new Error(response.statusText));
                    return;
                }
                return response.text();
            }).then(out => {
                resolve(true);
            }).catch(reject);
        });
    }
    static getUser(key) {
        return new Promise((resolve, reject) => {
            fetch(this.restUrl + "/users/" + key, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                }
            }).then((response) => {
                return response.json();
            }).then((output) => {
                var outUser = {
                    displayName: ko.observable(output.displayName),
                    email: ko.observable(output.email),
                    firstName: ko.observable(output.firstName),
                    lastName: ko.observable(output.lastName),
                    key: ko.observable(output.key),
                    points: ko.observable(output.points || 0),
                    role: ko.observable(output.role),
                    editing: ko.observable(false),
                    fullname: ko.observable(output.firstName + " " + output.lastName)
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
                return response.json();
            }).then((outArray) => {
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
                        editing: ko.observable(false),
                        fullname: ko.observable(x.firstName + " " + x.lastName)
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
    static getAllChallenges() {
        return new Promise((resolve, reject) => {
            let url = this.restUrl + "/challenges";
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
                return response.json();
            }).then((output) => {
                resolve(output);
            }).catch(error => {
                reject(error);
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
                        done: ko.observable(false),
                        scored: ko.observable(restRace.scored),
                        key: restRace.key
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
