/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var FormulaWednesdayApp = (function () {
    function FormulaWednesdayApp() {
        this.currentPage = ko.observable("");
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
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then(function (user) {
                _this.refreshUserInfo(user);
            });
        }
        this.currentPage.subscribe(function (page) {
            _this.loadPage(page);
        });
        this.currentPage("homepage");
        ko.applyBindings(this);
    };
    FormulaWednesdayApp.prototype.refreshUserInfo = function (user) {
        var _this = this;
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        FirebaseUtilities.getRaces().then(function (races) {
            _this.races(races);
        });
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.username());
    };
    FormulaWednesdayApp.prototype.doLogIn = function () {
        var _this = this;
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then(function (user) {
            _this.refreshUserInfo(user);
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
        //if (this.loggedIn()) {
        //    window.localStorage.setItem(this.currentPageKey, page);
        //}
        var _this = this;
        var newPage;
        switch (page.split("#")[0]) {
            case "homepage":
                newPage = new HomePage(this);
                break;
            case "challenges":
                window.localStorage.setItem(this.currentRaceKey, JSON.stringify(this.selectedRace));
                newPage = new ChallengesPage(this);
                break;
            case "preferences":
                newPage = new PreferencesPage(this);
                break;
            case "admin-users":
                newPage = new UsersAdmin(this);
                break;
            case "admin-challenges":
                newPage = new ChallengesAdmin(this);
                break;
            case "admin-races":
                newPage = new RacesAdmin(this);
                break;
            case "admin-drivers":
                newPage = new DriversAdmin(this);
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
    FormulaWednesdayApp.prototype.launchUserPreferences = function () {
        this.currentPage("preferences");
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