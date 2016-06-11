class FirebaseUtilities {
    static firebaseUrl: string = "https://formulawednesday.firebaseio.com/";

    static getUserInfo(credentials: Credentials): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            var fbCred: FirebaseCredentials = {
                email: credentials.name.toLowerCase(),
                password: credentials.password
            };

            var firebase = new Firebase(FirebaseUtilities.firebaseUrl);
            return firebase.authWithPassword(fbCred).then((auth) => {
                // output user
                var key = FormulaWednesdaysUtilities.getKeyFromEmail(fbCred.email);
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + key;
                var fb = new Firebase(userUrl);
                return fb.once("value").then((ds) => {
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
                    if (fbUser.results) {
                        user.results = fbUser.results;
                    }
                    return resolve(user);
                });
            }).catch(reject);
        });
    }

    static getChallengeByKey(key): Promise<Challenge> {
        return new Promise<Challenge>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges/" + key);
            return fb.once("value").then((ds) => {
                var fbChal = ds.val();
                if (!fbChal) {
                    return resolve(null);
                }
                this.getDrivers().then((d) => {
                    var chal: Challenge = {
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
    }

    static getChallengesForRace(race: Race): Promise<Challenge[]> {
        return new Promise<Challenge[]>((resolve, reject) => {
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

    static getBestOfTheWorstCandidates(names: string[]): Promise<Driver[]> {
        return new Promise<Driver[]>((resolve, reject) => {
            Promise.map(names, (name, index, array) => {
                return FirebaseUtilities.getDriverByName(name);
            }).then((values) => {
                return resolve(values);
            });
        });
    }

    static getChallenges(): Promise<Challenge[]> {
        return new Promise<Challenge[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges");
            return fb.once("value").then((ds) => {
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
                        type: ko.observable(fbChal.type),
                        drivers: ko.observableArray([])
                    };
                    chal.key = ko.observable(p);
                    c.push(chal);
                }
                return resolve(c);
            }).catch(reject);
        });
    }

    static getDriverByName(key: string): Promise<Driver> {
        return new Promise<Driver>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers/" + key);
            return fb.once("value").then((ds) => {
                var driver = <Driver>ds.val();
                driver.key = key;
                return resolve(driver);
            });
        });

    }

    static getDrivers(getInactive?: boolean): Promise<Driver[]> {
        return new Promise<Driver[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "drivers");
            return fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Driver[] = [];
                for (var p in values) {
                    var driver: Driver = values[p];
                    driver.key = p;
                    if (driver.active || getInactive) {
                        c.push(driver);
                    }
                }
                c.sort((aDriver: Driver, bDriver: Driver) => {
                    var aTeam = aDriver.team;
                    var bTeam = bDriver.team;
                    return aTeam.localeCompare(bTeam);
                });
                return resolve(c);
            }).catch(reject);
        });
    }

    static getRaces(season: string): Promise<Race[]> {
        return new Promise<Race[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races/" + season);
            return fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Race[] = [];
                for (var p in values) {
                    var race: Race = values[p];
                    race.scored = ko.observable(!!values[p]["scored"]);
                    race.name = p;
                    var raceDate = (<any>race.date).replace(/-/g, '/');
                    var cutoffDate = (<any>race.cutoff).replace(/-/g, '/');
                    race.date = new Date(raceDate);
                    race.cutoff = new Date(cutoffDate);
                    // increment cutoff by 1 to set it to midnight of that day
                    race.cutoff.setDate(race.cutoff.getDate() + 1);
                    race.done = ko.observable(new Date() > race.cutoff);
                    c.push(race);
                }
                Promise.map(c, (r, i, l) => {
                    this.getChallengesForRace(r).then((chal) => {
                        r.challenges = ko.observableArray(chal);
                    });
                });
                c = c.sort((r1, r2) => {
                    return r1.date.getTime() - r2.date.getTime();
                });
                return resolve(c);
            }).catch(reject);
        });
    }

    static getUserChoices(user: User): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + user.key() + "/results/2016");
            return fb.once("value").then((ds) => {
                return resolve(ds.val());
            }).catch(reject);
        });
    }

    static getAllUsers(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users");
            return fb.on("value", ((ds) => {
                var values = ds.val();
                var c: User[] = [];
                for (var p in values) {
                    var u = values[p];
                    var user: User = {
                        key: ko.observable(u.key),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        fullname: ko.observable(u.fullname),
                        results: u.results || {},
                        username: ko.observable(u.username),
                        editing: ko.observable(false),
                        email: ko.observable(u.email)
                    }
                    c.push(user);
                }
                return resolve(c);
            }), (error) => { (reject) });
        });
    }

    static getTeams(): Promise<Team[]> {
        return new Promise<Team[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "teams");
            return fb.once("value").then((ds) => {
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
                return resolve(c);
            }).catch(reject);
        });
    }

    static saveUser(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "users/" + user.key());
            return fb.set({
                username: user.username(),
                fullname: user.fullname(),
                points: user.points(),
                role: user.role(),
                email: user.email()
            }).then(() => { return resolve(true) }).catch(reject);
        });
    }

    static saveChallengeChoices(user: User, race: Race, challenges: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "users/" + user.key() + "/results/2016/" + race.name);
            return fb.set(challenges).then(() => { return resolve(true) }).catch(reject);
        });
    }

    static createUser(user: User, hashedPassword: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl);
            var fbCred: FirebaseCredentials = {
                email: user.email(),
                password: hashedPassword
            }
            return fb.createUser(fbCred, (error, userData) => {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(userData);
            });
        });
    }

    static changePassword(user: User, oldPassword: string, newPassword: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl);
            var fbCred: FirebaseChangePasswordCredentials = {
                email: user.email(),
                oldPassword: oldPassword,
                newPassword: newPassword
            }
            return fb.changePassword(fbCred, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(true);
            });
        });
    }

    static changeUsername(user: User, newUsername: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "/users/" + user.key() + "/username");
            return fb.set(newUsername, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(true);
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
                "key": processedEmail
            }
            return fb.set(newUser).then(() => { return resolve(true) }).catch(reject);
        });
    }

    static getUserByKey(key: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "users/" + key);
            return fb.once("value").then((ds) => {
                var value = ds.val();
                var userData: User = {
                    editing: ko.observable(false),
                    email: ko.observable(value["email"]),
                    fullname: ko.observable(value["fullname"]),
                    points: ko.observable(value["points"]),
                    key: ko.observable(key),
                    role: ko.observable(value["role"]),
                    username: ko.observable(value["username"])
                }
                return resolve(userData);
            });
        });
    }

    static addNewBlogPost(post: BlogObject): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var by = post.user.key();
            var title = post.title;
            var time = post.timestamp;
            var message = post.message;
            message = FirebaseUtilities.escape(message);
            var fb = new Firebase(this.firebaseUrl + "blogPosts/" + time + by);
            var newPost = {
                "title": title,
                "user": by,
                "message": message,
                "timestamp": time
            }
            return fb.set(newPost).then(() => { return resolve(true) }).catch(reject);
        });
    }

    static getBlogPosts(count?: number): Promise<BlogObject[]> {
        if (!count) {
            count = 5;
        }
        return new Promise<BlogObject[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "blogPosts");
            return fb.once("value").then((ds) => {
                var values = ds.val();
                var blog: BlogObject[] = [];
                var promises: string[] = [];
                for (var p in values) {
                    var b: BlogObject = values[p];
                    var key = b["user"];
                    b.message = FirebaseUtilities.unescape(b.message);
                    promises.push(<any>key);
                    blog.push(b);
                }
                return Promise.all(blog.map((blog, i, a) => {
                    return FirebaseUtilities.getUserByKey(<any>blog.user).then((u) => {
                        blog.user = u;
                    });
                })).then((us) => {
                    blog.sort((aB: BlogObject, bB: BlogObject) => {
                        var aTime = +aB.timestamp;
                        var bTime = +bB.timestamp;
                        return bTime - aTime;
                    });
                    blog.forEach((b) => {
                        b.timestamp = new Date(+b.timestamp).toLocaleDateString();
                    });
                    if (blog.length >= count) {
                        blog = blog.splice(0, count);
                    }
                    return resolve(blog);
                });
            }).catch(reject);
        });
    }

    static escape(inString: string) {
        var enc = encodeURIComponent(inString);
        var rep = enc.replace(/\./g, "%2E");
        return rep;
    }
    static unescape(inString: string) {
        return decodeURIComponent(inString);
    }

    static setRaceResults(race: Race): Promise<Race> {
        return new Promise<Race>((resolve, reject) => {
            var fb = new Firebase(this.firebaseUrl + "races/" + race.season + "/" + race.name + "/results");
            return fb.set(race.results).then(() => {
                fb = new Firebase(this.firebaseUrl + "races/" + race.season + "/" + race.name + "/scored");
                return fb.set(true).then(() => {
                    return resolve(race);
                });
            }).catch(reject);
        });
    }

    static setPoints(user: User) {
        var url = this.firebaseUrl + "users/" + user.key() + "/points";
        var fb = new Firebase(url);
        return fb.set(user.points());
    }

    static setDriverPoints(drivers: Driver[]) {
        drivers.forEach((x) => {
            var url = this.firebaseUrl + "drivers/" + x.key + "/points";
            var fb = new Firebase(url);
            fb.set(+x.points);
            url = this.firebaseUrl + "drivers/" + x.key + "/wins";
             fb = new Firebase(url);
            fb.set(+x.wins);
        });
    }
}