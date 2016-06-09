class RestUtilities {
    static restUrl = "http://104.196.36.209:32187";
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
            fetch(this.restUrl + "/users/basicinfo", {
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
}