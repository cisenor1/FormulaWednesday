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
                var id = credentials.name.split('@')[0];
                var userUrl = FirebaseUtilities.firebaseUrl + "users/" + id;
                var fb = new Firebase(userUrl);
                fb.once("value").then((ds) => {
                    var fbUser = ds.val();
                    var user: User = {
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
    }

    static getChallenges(): Promise<Challenge[]> {
        return new Promise<Challenge[]>((resolve, reject) => {
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "challenges");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Challenge[] = [];
                for (var p in values) {
                    var chal: Challenge = values[p];
                    chal.key = p;
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
                    var chal: Driver = values[p];
                    chal.key = p;
                    c.push(chal);
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
            var fb = new Firebase(FirebaseUtilities.firebaseUrl + "races");
            fb.once("value").then((ds) => {
                var values = ds.val();
                var c: Race[] = [];
                for (var p in values) {
                    var chal: Race = values[p];
                    chal.name = p;

                    c.push(chal);
                }
                resolve(c);
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
                    var chal: User = {
                        id: ko.observable(p),
                        points: ko.observable(u.points),
                        role: ko.observable(u.role),
                        name: ko.observable(u.name),
                        editing: ko.observable(false)
                    }
                    c.push(chal);
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
                    var chal: Team = values[p];
                    chal.key = p;
                    c.push(chal);
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
            var fb = new Firebase(this.firebaseUrl + "users/" + user.id());
            fb.set({
                name: user.name(),
                points: user.points(),
                role: user.role()
            }).then(() => { resolve(true) }).catch((error: Error) => reject(error));
        });
    }
}