/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var FormulaWednesdayApp = (function () {
    function FormulaWednesdayApp() {
        this.adminDropdown = "admin-dropdown";
        this.challenges = ko.observableArray([]);
        this.credentialsKey = "formulawednesday.user";
        this.currentPage = ko.observable("");
        this.currentPageKey = "formulawednesday.page";
        this.currentRaceKey = "formulawednesday.race";
        this.drivers = ko.observableArray([]);
        this.isAdmin = ko.observable(false);
        this.loggedIn = ko.observable(false);
        this.nameObservable = ko.observable("");
        this.logOutMessage = ko.observable(this.logOutText + this.nameObservable());
        this.logOutText = "Log out of ";
        this.pageContent = "page-content-div";
        this.pwObservable = ko.observable("");
        this.raceDropdown = "race-dropdown";
        this.races = ko.observableArray([]);
        this.sortedUsers = ko.observableArray([]);
        this.sortedDrivers = ko.observableArray([]);
        this.teams = ko.observableArray([]);
        this.nextRaceId = ko.observable();
        this.modalVisible = ko.observable(false);
        this.modalText = ko.observable("");
        this.modalTitle = ko.observable("");
        this.modalOKText = ko.observable("");
        this.modalCancelText = ko.observable("");
        this.countdownText = ko.observable("");
        this.countdownValue = ko.observable("");
        this.errors = ko.observableArray([]);
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
            },
            {
                binding: "admin-blog",
                label: "Blog"
            }
        ]);
    }
    FormulaWednesdayApp.prototype.initialize = function () {
        var _this = this;
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then(function (user) {
                _this.refreshUserInfo(user);
            }).catch(function (e) {
                _this.alert(e);
            });
        }
        this.currentPage.subscribe(function (page) {
            _this.loadPage(page);
        });
        this.currentPage("homepage");
        this.buildCountdown();
        ko.applyBindings(this);
    };
    FormulaWednesdayApp.prototype.buildCountdown = function () {
        var _this = this;
        FirebaseUtilities.getNextRace().then(function (race) {
            _this.countdownText("Cutoff for the " + race.title + ": ");
            setInterval(function () {
                var countdown;
                _this.countdownValue(moment().countdown(race.cutoff).toString());
            }, 1000);
        }).catch(function (err) { _this.errors.push(err); });
        ;
    };
    FormulaWednesdayApp.prototype.refreshUserInfo = function (user) {
        var _this = this;
        this.buildStandingsTable();
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        FirebaseUtilities.getRaces("2016").then(function (races) {
            _this.races(races);
        }).catch(function (err) { _this.errors.push(err); });
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.username());
    };
    FormulaWednesdayApp.prototype.doLogIn = function () {
        var _this = this;
        alert("here");
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then(function (user) {
            _this.refreshUserInfo(user);
        }).catch(function (err) { _this.errors.push(err); });
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
        var _this = this;
        this.credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(this.credentials).catch(function (err) { _this.errors.push(err); });
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
            case "admin-blog":
                newPage = new BlogAdmin(this);
                break;
            case "standings":
                newPage = new StandingsPage(this);
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
    FormulaWednesdayApp.prototype.launchStandings = function () {
        this.currentPage("standings");
    };
    FormulaWednesdayApp.prototype.buildStandingsTable = function () {
        var _this = this;
        FirebaseUtilities.getAllUsers().then(function (allUsers) {
            var sortedUsers = allUsers.sort(function (a, b) {
                return b.points() - a.points();
            });
            _this.sortedUsers(sortedUsers);
        });
        FirebaseUtilities.getDrivers().then(function (d) {
            var sortedDrivers = d.sort(function (a, b) {
                return b.points - a.points;
            });
            _this.sortedDrivers(sortedDrivers);
        });
    };
    FormulaWednesdayApp.prototype.confirm = function (inString, title, okText, cancelText, okCallback, cancelCallback) {
        var _this = this;
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        this.modalCancelText(cancelText || "Cancel");
        $("#confirm-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one("click", "#modal-ok", function () {
            $("#confirm-modal").modal('hide');
            _this.cleanUpModal();
            if (okCallback) {
                okCallback();
            }
        }).one("click", "#modal-cancel", function () {
            _this.cleanUpModal();
            if (cancelCallback) {
                cancelCallback();
            }
        });
    };
    FormulaWednesdayApp.prototype.alert = function (inString, title, okText, callback) {
        var _this = this;
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        $("#alert-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one("click", "#modal-ok", function () {
            $("#alert-modal").modal('hide');
            _this.cleanUpModal();
            if (callback) {
                callback();
            }
        });
    };
    FormulaWednesdayApp.prototype.cleanUpModal = function () {
        this.modalCancelText("");
        this.modalTitle("");
        this.modalOKText("");
        this.modalText("");
    };
    return FormulaWednesdayApp;
}());
window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
};
