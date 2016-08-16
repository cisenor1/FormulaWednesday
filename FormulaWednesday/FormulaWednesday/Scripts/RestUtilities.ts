class RestUtilities {
    static restUrl = "http://192.168.215.1:32187";
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
                return this.getUser(this.auth.key, this.auth.id_token);
            }).then(resolve).catch(reject);
        });
    }

    static getUser(key: string, token: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            fetch(this.restUrl + "/users/" + this.auth.key, {
                headers: {
                    Authorization: "Bearer " + this.auth.id_token
                }
            }).then((response) => {
                return response.text();
            }).then((output) => {
                var ret = JSON.parse(output);
                var outUser: User = {
                    displayName: ko.observable<string>(ret.displayName),
                    email: ko.observable<string>(ret.email),
                    firstName: ko.observable<string>(ret.firstName),
                    lastName: ko.observable<string>(ret.lastName),
                    key: ko.observable<string>(ret.key),
                    points: ko.observable<number>(ret.points || 0),
                    role: ko.observable<string>(ret.role),
                    editing: ko.observable<boolean>(false)
                }
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
                return response.text();
            }).then((out) => {
                if (JSON.parse(out).statusCode !== 200) {
                    return reject(JSON.parse(out).message);
                }
                var outArray: any[] = JSON.parse(out);
                var users: User[] = [];
                outArray.forEach((x) => {
                    var user: User = {
                        displayName: ko.observable<string>(x.displayName),
                        firstName: ko.observable<string>(x.firstName),
                        lastName: ko.observable<string>(x.lastName),
                        email: ko.observable<string>(x.email),
                        key: ko.observable<string>(x.key),
                        role: ko.observable<string>(x.role),
                        points: ko.observable<number>(x.points || 0),
                        editing: ko.observable<boolean>(false)
                    }
                    users.push(user);
                });
                resolve(users);
            }).catch(reject);
        });
    }

    static getChallengesForRace(race: Race): Promise<Challenge[]> {
        return new Promise<Challenge[]>((resolve, reject) => {
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
                
                var outArray: any[] = JSON.parse(out);
                 
            });
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/" + race.season + "/" + race.name + "/selectedChallenges");
            return fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Challenge[] = [];
                var promises = [];
                for (var p in values) {
                    if (typeof values[p] === "string") {
                        promises.push(FirebaseUtilities.getChallengeByKey(values[p]));
                    } else {
                        promises.push(FirebaseUtilities.getBestOfTheWorstCandidates(values[p]));
                    }
                }
                if (promises.length) {
                    Promise.all(promises).then((values) => {
                        values.forEach((x) => {
                            if (x.length) {
                                // it's a driver array
                                var drivers: Driver[] = x;

                                var chal: Challenge = {
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
                            } else {
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

    static getRaces(season: string): Promise<Race[]> {
        return new Promise<Race[]>((resolve, reject) => {
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
                var outArray: RestRace[] = JSON.parse(out);
                var races: Race[] = [];
                outArray.forEach(restRace => {
                    var race: Race = {
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