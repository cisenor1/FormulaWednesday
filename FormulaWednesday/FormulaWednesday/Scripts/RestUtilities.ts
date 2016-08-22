/// <reference path="typings/moment/moment.d.ts" />

class RestUtilities {
    static restUrl = "http://192.168.0.16:32187";
    static auth: AuthResponse;

    static logIn(email: string, password: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            fetch(this.restUrl + "/users/authenticate", {
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                method: 'POST'
            }).then((response) => {
                return response.text();
            }).then((output) => {
                this.auth = <AuthResponse>JSON.parse(output);
                return this.getUser(this.auth.key);
                }).then(user => {
                    resolve(user);
                }).catch(reject);
        });
    }

    static updateUserPassword(user: User, newPassword: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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

    static createUser(user: RestUser): Promise<User> {
        return new Promise<User>((resolve, reject) => {
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
            }).then((out: AuthResponse) => {
                return this.getUser(out.key);
            }).then((newUser: User) => {
                resolve(newUser);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    static updateUserInfo(user: RestUser): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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

    static getUser(key: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            fetch(this.restUrl + "/users/" + key, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                }
            }).then((response) => {
                return response.json();
            }).then((output: RestUser) => {
                var outUser: User = {
                    displayName: ko.observable<string>(output.displayName),
                    email: ko.observable<string>(output.email),
                    firstName: ko.observable<string>(output.firstName),
                    lastName: ko.observable<string>(output.lastName),
                    key: ko.observable<string>(output.key),
                    points: ko.observable<number>(output.points || 0),
                    role: ko.observable<string>(output.role),
                    editing: ko.observable<boolean>(false),
                    fullname: ko.observable(output.firstName + " " + output.lastName)
                };
                resolve(outUser);
            });
        });
    }

    static getAllUsers(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
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
            }).then((outArray: RestUser[]) => {
                let users: User[] = [];
                outArray.forEach((x) => {
                    var user: User = {
                        displayName: ko.observable<string>(x.displayName),
                        firstName: ko.observable<string>(x.firstName),
                        lastName: ko.observable<string>(x.lastName),
                        email: ko.observable<string>(x.email),
                        key: ko.observable<string>(x.key),
                        role: ko.observable<string>(x.role),
                        points: ko.observable<number>(x.points || 0),
                        editing: ko.observable<boolean>(false),
                        fullname: ko.observable(x.firstName + " " + x.lastName)
                    }
                    users.push(user);
                });
                resolve(users);
            }).catch(reject);
        });
    }

    static getDrivers(activeOnly: boolean): Promise<Driver[]> {
        return new Promise<Driver[]>((resolve, reject) => {
            let url: string;
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

    static getChallengesForRace(race: Race): Promise<RestChallenge[]> {
        return new Promise<RestChallenge[]>((resolve, reject) => {
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
                let restChallenges: RestChallenge[] = JSON.parse(out);
                resolve(restChallenges);
            });
        });
    }

    static saveUserPicksForRace(race: Race, user: User, userPicks: RestUserPick[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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

    static getUserPicksForRace(race: Race, user: User): Promise<RestUserPick[]> {
        return new Promise<RestUserPick[]>((resolve, reject) => {
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
                let restUserPicks: RestUserPick[] = JSON.parse(out);
                resolve(restUserPicks);
            });
        });
    }

    static getRaces(season: string): Promise<Race[]> {
        return new Promise<Race[]>((resolve, reject) => {
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
                let outArray: RestRace[] = JSON.parse(out);
                let races: Race[] = [];
                outArray.forEach(restRace => {
                    let raceDateMoment = moment(restRace.raceDate);
                    let cutoffMoment = moment(restRace.cutoff);
                    let race: Race = {
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