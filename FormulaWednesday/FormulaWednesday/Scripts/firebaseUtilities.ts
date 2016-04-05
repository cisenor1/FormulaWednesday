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
                        id: id,
                        email: credentials.name,
                        role: fbUser.role,
                        points: fbUser.points,
                        name: fbUser.name
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
}