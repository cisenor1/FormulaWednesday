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
        this.nextRaceId = ko.observable();
        this.modalVisible = ko.observable(false);
        this.logIsVisible = ko.observable(false);
        this.modalText = ko.observable("");
        this.modalTitle = ko.observable("");
        this.modalOKText = ko.observable("");
        this.modalCancelText = ko.observable("");
        this.countdownText = ko.observable("");
        this.countdownValue = ko.observable("");
        this.errors = ko.observableArray([]);
        this.longClicking = false;
        this.longClickTime = 1000;
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
    beginLongClick(e) {
        this.longClicking = true;
        this.longClickTimer = setTimeout(() => { this.openLog(); }, this.longClickTime);
        return e;
    }
    openLog() {
        if (this.longClickTimer) {
            clearTimeout(this.longClickTimer);
        }
        if (this.longClicking) {
            this.logIsVisible(!this.logIsVisible());
        }
    }
    endLongClick(e) {
        if (this.longClickTimer) {
            clearTimeout(this.longClickTimer);
        }
        this.longClicking = false;
    }
    initialize() {
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        if (this.credentials) {
            RestUtilities.logIn(this.credentials.name, this.credentials.password).then((user) => {
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
    //buildCountdown() {
    //    FirebaseUtilities.getNextRace().then((race) => {
    //        this.countdownText("Cutoff for the " + race.title + ": ");
    //        setInterval(() => {
    //            var countdown;
    //            this.countdownValue((<any>moment()).countdown(race.cutoff).toString());
    //        }, 1000);
    //    }).catch((err) => {
    //        this.logError(err);
    //    });
    //}
    refreshUserInfo(user) {
        this.buildStandingsTable();
        // TODO: We need to find a better way to do this. Right now to be able to refresh we'll be storing the password as plaintext.
        // TODO: We could encode, or better yet, figure out a way to store a refresh token or similar.
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        RestUtilities.getRaces("2016").then((races) => {
            this.races(races);
        });
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.displayName());
    }
    doLogIn() {
        if (!this.nameObservable()) {
            return;
        }
        RestUtilities.logIn(this.nameObservable(), this.pwObservable()).then((user) => {
            this.credentials = {
                name: this.nameObservable(),
                password: this.pwObservable()
            };
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
    loadPage(page) {
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
        RestUtilities.getAllUsers().then((allUsers) => {
            var sortedUsers = allUsers.sort((a, b) => {
                return b.points() - a.points();
            });
            this.sortedUsers(sortedUsers);
        });
        RestUtilities.getDrivers(false).then((d) => {
            var sortedDrivers = d.sort((a, b) => {
                return b.points - a.points;
            });
            this.sortedDrivers(sortedDrivers);
        });
    }
    confirm(inString, title, okText, cancelText, okCallback, cancelCallback) {
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        this.modalCancelText(cancelText || "Cancel");
        $("#confirm-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one("click", "#modal-ok", () => {
            $("#confirm-modal").modal('hide');
            this.cleanUpModal();
            if (okCallback) {
                okCallback();
            }
        }).one("click", "#modal-cancel", () => {
            this.cleanUpModal();
            if (cancelCallback) {
                cancelCallback();
            }
        });
    }
    alert(inString, title, okText, callback) {
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        $("#alert-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one("click", "#modal-ok", () => {
            $("#alert-modal").modal('hide');
            this.cleanUpModal();
            if (callback) {
                callback();
            }
        });
    }
    cleanUpModal() {
        this.modalCancelText("");
        this.modalTitle("");
        this.modalOKText("");
        this.modalText("");
    }
    logError(err) {
        let f = new FWEDError(err.message);
        //let f = FirebaseUtilities.getError(err);
        this.errors.push(f);
    }
}
window.onload = function () {
    tinymce.init({ selector: '#new-blog-content' });
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
};
// Prevent Bootstrap dialog from blocking focusin
$(document).on('focusin', function (e) {
    if ($(e.target).closest(".mce-window").length) {
        e.stopImmediatePropagation();
    }
});
