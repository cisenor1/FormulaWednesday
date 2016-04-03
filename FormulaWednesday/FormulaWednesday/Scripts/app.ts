/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var nameObservable: KnockoutObservable<string> = ko.observable("");
var pwObservable: KnockoutObservable<string> = ko.observable("");
var loggedIn: KnockoutObservable<boolean> = ko.observable(false);
var credentialsKey: string = "formulawednesday.user";
var credentials: Credentials;
var logOutText: string = "Log out of ";
var logOutMessage: KnockoutObservable<string> = ko.observable(logOutText + nameObservable());
var user: User;
var firebaseUser: string = "formulawednesday@gmail.com";
var firebasePassword: string = "crashtorislife";
var firebaseUrl: string = "https://formulawednesday.firebaseio.com/";
var firebase: Firebase;
var fireAuth: FirebaseAuthData;
var username: string;

var md5: any;
function doLogIn() {
    if (!nameObservable()) {
        return;
    }
    var hashed = md5(pwObservable());
    logInProcedure(nameObservable(), hashed);
}

function doLogOut() {
    window.localStorage.removeItem(credentialsKey);
    loggedIn(false);
    nameObservable("");
}

function logInProcedure(name, password) {
    checkForUser(name, password).then((success) => {
        if (success) {
            credentials = {
                name: name,
                password: password
            }
            window.localStorage.setItem(credentialsKey, JSON.stringify(credentials));
            username = name.split('@')[0];
            loggedIn(true);
            buildForm();
        }
    }).catch((error) => {
        alert(error.message);
    });
}

function checkForUser(name: string, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        var fbCred: FirebaseCredentials = {
            email: name,
            password: password
        };

        firebase = new Firebase(firebaseUrl);
        firebase.authWithPassword(fbCred).then((auth) => {
            fireAuth = auth;
            // output user
            var userUrl = firebaseUrl + "users/" + username;
            var fb = new Firebase(userUrl);
            fb.once("value", (ds) => {
                var user: User = ds.val();
                logOutMessage(logOutText + user.name);
            });
            resolve(true);
        });
    });

}

function buildForm() {
    if (!loggedIn()) {
        return;
    }

}

var viewModel = {
    doLogIn: doLogIn,
    loginName: nameObservable,
    loggedIn: loggedIn,
    logOutMessage: logOutMessage,
    logOut: doLogOut,
    password: pwObservable
}

window.onload = function () {
    credentials = JSON.parse(window.localStorage.getItem(credentialsKey));
    if (credentials) {
        logInProcedure(credentials.name, credentials.password);
    }
    ko.applyBindings(viewModel);
}

