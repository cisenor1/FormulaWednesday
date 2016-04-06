///// <reference path="firebaseutilities.ts" />
//var credentialsKey: string = "formulawednesday.user";
//var adminSectionKey: string = "formulawednesday.admin.section";
//class AdminManager {
//    credentials: Credentials;
//    adminViewModel: any;
//    constructor(credentials: Credentials) {
//        this.credentials = credentials;
//        this.adminViewModel = {};
//    }
//    logInProcedure() {
//        checkForUser(this.credentials.name, this.credentials.password).then((success) => {
//            if (success) {
//                ko.applyBindings(this.adminViewModel);
//                window.localStorage.setItem(credentialsKey, JSON.stringify(this.credentials));
//                loggedIn(true);
//                var promises = [];
//                promises.push(getChallenges());
//                promises.push(getTeams());
//                promises.push(getDrivers());
//                Promise.all(promises).then((values) => {
//                    challenges(<any>values[0]);
//                    teams(<any>values[1]);
//                    drivers(<any>values[2]);
//                    buildForm();
//                });
//            }
//        }).catch((error) => {
//            alert(error.message);
//        });
//    }
//}
//window.onload = function () {
//    credentials = JSON.parse(window.localStorage.getItem(credentialsKey));
//    var admin = new AdminManager(credentials);
//    admin.logInProcedure();
//    var section = window.localStorage.getItem(adminSectionKey);   
//} 
