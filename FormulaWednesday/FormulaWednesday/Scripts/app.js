/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var FormulaWednesdayApp = (function () {
    function FormulaWednesdayApp() {
        this.currentPage = ko.observable("header");
        this.nameObservable = ko.observable("");
        this.pwObservable = ko.observable("");
        this.loggedIn = ko.observable(false);
        this.credentialsKey = "formulawednesday.user";
        this.currentPageKey = "formulawednesday.page";
        this.logOutText = "Log out of ";
        this.logOutMessage = ko.observable(this.logOutText + this.nameObservable());
        this.isAdmin = ko.observable(false);
        this.challenges = ko.observableArray([]);
        this.drivers = ko.observableArray([]);
        this.teams = ko.observableArray([]);
        this.pageContent = "page-content-div";
    }
    FormulaWednesdayApp.prototype.initialize = function () {
        var _this = this;
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        var page = window.localStorage.getItem(this.currentPageKey);
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password);
        }
        this.currentPage.subscribe(function (page) {
            _this.loadPage(page);
        });
        if (page) {
            this.currentPage(page);
        }
        ko.applyBindings(this);
    };
    FormulaWednesdayApp.prototype.doLogIn = function () {
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed);
    };
    FormulaWednesdayApp.prototype.doLogOut = function () {
        window.localStorage.removeItem(this.credentialsKey);
        window.localStorage.removeItem(this.currentPageKey);
        this.loggedIn(false);
        this.isAdmin(false);
        this.launchHomepage();
        this.nameObservable("");
        this.pwObservable("");
    };
    FormulaWednesdayApp.prototype.logInProcedure = function (name, password) {
        var _this = this;
        var credentials = {
            name: name,
            password: password
        };
        FirebaseUtilities.getUserInfo(credentials).then(function (user) {
            window.localStorage.setItem(_this.credentialsKey, JSON.stringify(credentials));
            _this.loggedIn(true);
            _this.user = user;
            _this.isAdmin(user.role.toLowerCase() == "admin");
            _this.logOutMessage(_this.logOutText + user.name);
        }).catch(function (error) { return alert(error.message); });
    };
    FormulaWednesdayApp.prototype.loadPage = function (page) {
        var _this = this;
        if (this.loggedIn()) {
            window.localStorage.setItem(this.currentPageKey, page);
        }
        var newPage;
        switch (page) {
            case "header":
                newPage = new HomePage();
                break;
            case "challenges":
                newPage = new ChallengesPage(this);
                break;
            default:
                newPage = new HomePage();
                break;
        }
        newPage.getViewModel().then(function (vm) {
            newPage.getMarkup().then(function (markup) {
                var ele = document.getElementById(_this.pageContent);
                ele.innerHTML = markup;
                ko.applyBindings(vm, ele);
            });
        });
    };
    FormulaWednesdayApp.prototype.buildForm = function () {
        if (!this.loggedIn()) {
            return;
        }
    };
    FormulaWednesdayApp.prototype.launchHomepage = function () {
        this.currentPage("header");
    };
    FormulaWednesdayApp.prototype.launchAdmin = function () {
        if (this.user.role.toLowerCase() !== "admin") {
            return;
        }
        window.location.href = window.location.origin + "/admin.html";
    };
    FormulaWednesdayApp.prototype.launchChallenges = function () {
        this.currentPage('challenges');
    };
    return FormulaWednesdayApp;
})();
window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
};
//# sourceMappingURL=app.js.map