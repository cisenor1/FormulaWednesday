/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
class FormulaWednesdayApp {
    constructor() {
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
    initialize() {
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then((user) => {
                this.refreshUserInfo(user);
            }).catch((e) => {
                alert(e);
            });
        }
        this.currentPage.subscribe((page) => {
            this.loadPage(page);
        });
        this.currentPage("homepage");
        ko.applyBindings(this);
    }
    refreshUserInfo(user) {
        this.buildStandingsTable();
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        FirebaseUtilities.getRaces("2016").then((races) => {
            this.races(races);
        });
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.username());
    }
    doLogIn() {
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then((user) => {
            this.refreshUserInfo(user);
        }).catch((e) => {
            alert(e);
        });
    }
    doLogOut() {
        window.localStorage.removeItem(this.credentialsKey);
        window.localStorage.removeItem(this.currentPageKey);
        window.localStorage.removeItem(this.currentRaceKey);
        this.loggedIn(false);
        this.isAdmin(false);
        this.nameObservable("");
        this.pwObservable("");
        this.launchHomepage();
    }
    logInProcedure(name, password) {
        this.credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(this.credentials);
    }
    loadPage(page) {
        //if (this.loggedIn()) {
        //    window.localStorage.setItem(this.currentPageKey, page);
        //}
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
        newPage.getViewModel().then((vm) => {
            newPage.getMarkup().then((markup) => {
                var ele = document.getElementById(this.pageContent);
                ko.cleanNode(ele);
                ele.innerHTML = markup;
                ko.applyBindings(vm, ele);
            });
        });
    }
    buildForm() {
        if (!this.loggedIn()) {
            return;
        }
    }
    launchHomepage() {
        this.currentPage("homepage");
    }
    launchAdmin() {
        if (this.user.role().toLowerCase() !== "admin") {
            return;
        }
        window.location.href = window.location.origin + "/admin.html";
    }
    launchChallenges() {
        this.currentPage('challenges');
    }
    launchAdminPage(item) {
        this.currentPage(item.binding);
    }
    launchUserPreferences() {
        this.currentPage("preferences");
    }
    launchRacePage(race) {
        this.selectedRace = race;
        this.currentPage('challenges#' + race.name);
    }
    launchStandings() {
        this.currentPage("standings");
    }
    buildStandingsTable() {
        FirebaseUtilities.getAllUsers().then((allUsers) => {
            var sortedUsers = allUsers.sort((a, b) => {
                return b.points() - a.points();
            });
            this.sortedUsers(sortedUsers);
        });
        FirebaseUtilities.getDrivers().then((d) => {
            var sortedDrivers = d.sort((a, b) => {
                return b.points - a.points;
            });
            this.sortedDrivers(sortedDrivers);
        });
    }
}
window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
};
