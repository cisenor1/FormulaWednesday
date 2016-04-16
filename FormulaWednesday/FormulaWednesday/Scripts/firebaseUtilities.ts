class FirebaseUtilities {
    static firebaseUrl: string = "https://formulawednesday.firebaseio.com/";

    static getUserInfo(credentials: Credentials): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            var fbCred: FirebaseCredentials = {
                email: credentials.name,
                password: credentials.password
            };

            var firebase = new Firebase(FirebaseUtilities.firebaseUrl);
            firebase.authWithPassword(fbCred).then((auth) => {
                // output user
                var key = FormulaWednesdaysUtilities.getKeyFromEmail(fbCred.email);
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + key;
                var fb = new Firebase(userUrl);
                fb.once("value").then((ds) => {
                    var fbUser = ds.val();
                    var user: User = {
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
    }

    static getChallenges(): Promise<Challenge[]> {
        return new Promise<Challenge[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Challenge[] = [];
                for (var p in values) {
                    var fbChal = values[p];
                    var chal: Challenge = {
                       choice: ko.observable(fbChal.choice),
                       description: ko.observable(fbChal.description),
                       key: ko.observable(fbChal.key),
                       allSeason: ko.observable(fbChal.allSeason),
                       message: ko.observable(fbChal.message),
                       value: ko.observable(fbChal.value),
                       editing: ko.observable(false),
                       type: ko.observable(fbChal.type)
                    };
                    c.push(chal);
                }
                resolve(c);
            }).catch(reject);
        });
    }

    static getDrivers(): Promise<Driver[]> {
        return new Promise<Driver[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Driver[] = [];
                for (var p in values) {
                    var driver: Driver = values[p];
                    driver.key = p;
                    c.push(driver);
                }
                c.sort((aDriver: Driver, bDriver: Driver) => {
                    var aTeam = aDriver.team;
                    var bTeam = bDriver.team;
                    return aTeam.localeCompare(bTeam);
                });
                resolve(c);
            }).catch(reject);
        });
    }

    static getRaces(): Promise<Race[]> {
        return new Promise<Race[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/2016");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Race[] = [];
                for (var p in values) {
                    var race: Race = values[p];
                    race.name = p;
                    race.date = new Date((<any>race.date));
                    race.cutoff = new Date((<any>race.cutoff));
                    race.done = ko.observable(new Date() > race.cutoff);
                    c.push(race);
                }

                c = c.sort((r1, r2) => {
                    return r1.date.getTime() - r2.date.getTime();
                });
                resolve(c);
            }).catch(reject);
        });
    }

    static getUserChoices(user: User): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + user.key() + "/results/2016");
            fb.once("value").then((ds) => {
                resolve(ds.val());
            }).catch(reject);
        });
    }

    static getAllUsers(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users");
            fb.on("value", ((ds) => {
                var values = ds.val();
                var c: User[] = [];
                for (var p in values) {
                    var u = values[p];
                    var user: User = {
                        key: ko.observable(u.key),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        fullname: ko.observable(u.fullname),
                        username: ko.observable(u.username),
                        editing: ko.observable(false),
                        email: ko.observable(u.email)
                    }
                    c.push(user);
                }
                resolve(c);
            }), (error) => { (reject) });
        });
    }

    static getTeams(): Promise<Team[]> {
        return new Promise<Team[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "teams");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Team[] = [];
                for (var p in values) {
                    var team: Team = values[p];
                    team.key = p;
                    c.push(team);
                }
                c.sort((aTeam: Team, bTeam: Team) => {
                    var aName = aTeam.name;
                    var bName = bTeam.name;
                    return aName.localeCompare(bName);
                });
                resolve(c);
            }).catch(reject);
        });
    }

    static saveUser(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "users/" + user.key());
            fb.set({
                username: user.username(),
                fullname: user.fullname(),
                points: user.points(),
                role: user.role(),
                email: user.email()
            }).then(() => { resolve(true) }).catch(reject);
        });
    }

    static saveChallengeChoices(user: User, race: Race, challenges: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "users/" + user.key() + "/results/2016/" + race.name);
            fb.set(challenges).then(() => { resolve(true) }).catch(reject);
        });
    }

    static createUser(user: User, hashedPassword: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl);
            var fbCred: FirebaseCredentials = {
                email: user.email(),
                password: hashedPassword
            }
            fb.createUser(fbCred, (error, userData) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(userData);
            });
        });
    }

    static changePassword(user: User, oldPassword: string, newPassword:string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl);
            var fbCred: FirebaseChangePasswordCredentials = {
                email: user.email(),
                oldPassword: oldPassword,
                newPassword: newPassword
            }
            fb.changePassword(fbCred, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    }

    static changeUsername(user: User, newUsername: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "/users/" + user.key() + "/username");
            fb.set(newUsername, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    }

    static addNewUser(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var email = user.email();
            var processedEmail = FormulaWednesdaysUtilities.getKeyFromEmail(email);
            var fb = new Firebase(this.firebaseUrl + "users/" + processedEmail);
            var newUser = {
                "username": user.username(),
                "fullname": user.fullname(),
                "points": 0,
                "email": user.email(),
                "role": user.role(),
                "key":processedEmail
            }
            fb.set(newUser).then(() => { resolve(true) }).catch(reject);
        });
    }
}