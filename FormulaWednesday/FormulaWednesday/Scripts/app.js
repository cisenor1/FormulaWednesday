/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var FormulaWednesdayApp = (function () {
    function FormulaWednesdayApp() {
        this.currentPage = ko.observable("homepage");
        this.nameObservable = ko.observable("");
        this.pwObservable = ko.observable("");
        this.loggedIn = ko.observable(false);
        this.credentialsKey = "formulawednesday.user";
        this.currentPageKey = "formulawednesday.page";
        this.currentRaceKey = "formulawednesday.race";
        this.logOutText = "Log out of ";
        this.logOutMessage = ko.observable(this.logOutText + this.nameObservable());
        this.isAdmin = ko.observable(false);
        this.challenges = ko.observableArray([]);
        this.drivers = ko.observableArray([]);
        this.teams = ko.observableArray([]);
        this.races = ko.observableArray([]);
        this.pageContent = "page-content-div";
        this.raceDropdown = "race-dropdown";
        this.adminDropdown = "admin-dropdown";
        this.adminMenu = ko.observableArray([
            {
                binding: "admin-users",
                label: "Users"
            },
            {
                binding: "admin-drivers",
                label: "Drivers"
            },
            {
                binding: "admin-races",
                label: "Races"
            }, {
                binding: "admin-challenges",
                label: "Challenges"
            }
        ]);
    }
    FormulaWednesdayApp.prototype.initialize = function () {
        var _this = this;
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        var page = window.localStorage.getItem(this.currentPageKey);
        var r = window.localStorage.getItem(this.currentRaceKey);
        var race;
        if (r !== "undefined") {
            race = JSON.parse(r);
        }
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then(function (user) {
                _this.completeLogIn(user);
                if (page) {
                    _this.currentPage(page);
                }
                if (race && race != "undefined") {
                    _this.selectedRace = race;
                    _this.selectedRace.date = new Date(Date.parse(_this.selectedRace.date));
                    _this.selectedRace.cutoff = new Date(Date.parse(_this.selectedRace.cutoff));
                    _this.selectedRace.done = ko.observable(_this.selectedRace.date < new Date(Date.now()));
                    window.localStorage.setItem(_this.currentRaceKey, JSON.stringify(_this.selectedRace));
                }
            });
        }
        this.currentPage.subscribe(function (page) {
            _this.loadPage(page);
        });
        FirebaseUtilities.getRaces().then(function (races) {
            _this.races(races);
        });
        ko.applyBindings(this);
    };
    FormulaWednesdayApp.prototype.completeLogIn = function (user) {
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.name());
    };
    FormulaWednesdayApp.prototype.doLogIn = function () {
        var _this = this;
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then(function (user) {
            _this.completeLogIn(user);
        });
    };
    FormulaWednesdayApp.prototype.doLogOut = function () {
        window.localStorage.removeItem(this.credentialsKey);
        window.localStorage.removeItem(this.currentPageKey);
        window.localStorage.removeItem(this.currentRaceKey);
        this.loggedIn(false);
        this.isAdmin(false);
        this.nameObservable("");
        this.pwObservable("");
        this.launchHomepage();
    };
    FormulaWednesdayApp.prototype.logInProcedure = function (name, password) {
        this.credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(this.credentials);
    };
    FormulaWednesdayApp.prototype.loadPage = function (page) {
        var _this = this;
        if (this.loggedIn()) {
            window.localStorage.setItem(this.currentPageKey, page);
        }
        var newPage;
        switch (page.split("#")[0]) {
            case "homepage":
                newPage = new HomePage(this);
                break;
            case "challenges":
                window.localStorage.setItem(this.currentRaceKey, JSON.stringify(this.selectedRace));
                newPage = new ChallengesPage(this);
                break;
            case "admin-users":
                newPage = new UsersAdmin(this);
                break;
            default:
                newPage = new HomePage(this);
                break;
        }
        newPage.getViewModel().then(function (vm) {
            newPage.getMarkup().then(function (markup) {
                var ele = document.getElementById(_this.pageContent);
                ko.cleanNode(ele);
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
        this.currentPage("homepage");
    };
    FormulaWednesdayApp.prototype.launchAdmin = function () {
        if (this.user.role().toLowerCase() !== "admin") {
            return;
        }
        window.location.href = window.location.origin + "/admin.html";
    };
    FormulaWednesdayApp.prototype.launchChallenges = function () {
        this.currentPage('challenges');
    };
    FormulaWednesdayApp.prototype.launchAdminPage = function (item) {
        this.currentPage(item.binding);
    };
    FormulaWednesdayApp.prototype.launchRacePage = function (race) {
        this.selectedRace = race;
        this.currentPage('challenges#' + race.name);
    };
    return FormulaWednesdayApp;
})();
window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
};
//# sourceMappingURL=app.js.map