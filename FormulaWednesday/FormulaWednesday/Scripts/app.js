/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var nameObservable = ko.observable("");
var pwObservable = ko.observable("");
var loggedIn = ko.observable(false);
var credentialsKey = "formulawednesday.user";
var credentials;
var logOutText = "Log out of ";
var logOutMessage = ko.observable(logOutText + nameObservable());
var user;
var firebaseUser = "formulawednesday@gmail.com";
var firebasePassword = "crashtorislife";
var firebaseUrl = "https://formulawednesday.firebaseio.com/";
var firebase;
var fireAuth;
var username;
var md5;
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
    checkForUser(name, password).then(function (success) {
        if (success) {
            credentials = {
                name: name,
                password: password
            };
            window.localStorage.setItem(credentialsKey, JSON.stringify(credentials));
            username = name.split('@')[0];
            loggedIn(true);
            buildForm();
        }
    }).catch(function (error) {
        alert(error.message);
    });
}
function checkForUser(name, password) {
    return new Promise(function (resolve, reject) {
        var fbCred = {
            email: name,
            password: password
        };
        firebase = new Firebase(firebaseUrl);
        firebase.authWithPassword(fbCred).then(function (auth) {
            fireAuth = auth;
            // output user
            var userUrl = firebaseUrl + "users/" + username;
            var fb = new Firebase(userUrl);
            fb.once("value", function (ds) {
                var user = ds.val();
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
    // output user
    var userUrl = firebaseUrl + "users/" + username;
    var fb = new Firebase(userUrl);
    fb.once("value", function (ds) {
        var user = ds.val();
        logOutMessage(logOutText + user.name);
    });
}
var viewModel = {
    doLogIn: doLogIn,
    loginName: nameObservable,
    loggedIn: loggedIn,
    logOutMessage: logOutMessage,
    logOut: doLogOut,
    password: pwObservable
};
window.onload = function () {
    credentials = JSON.parse(window.localStorage.getItem(credentialsKey));
    if (credentials) {
        logInProcedure(credentials.name, credentials.password);
    }
    ko.applyBindings(viewModel);
};
//# sourceMappingURL=app.js.map