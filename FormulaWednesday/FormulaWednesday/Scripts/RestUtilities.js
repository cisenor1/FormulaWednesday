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
}
RestUtilities.restUrl = "http://104.196.36.209:32187";
