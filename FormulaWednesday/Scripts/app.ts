/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
declare var md5;
class FormulaWednesdayApp {
    adminDropdown: string = "admin-dropdown";
    challenges: KnockoutObservableArray<Challenge> = ko.observableArray([]);
    credentials: Credentials;
    credentialsKey: string = "formulawednesday.user";
    currentPage = ko.observable("");
    currentPageKey: string = "formulawednesday.page";
    currentRaceKey: string = "formulawednesday.race";
    drivers: KnockoutObservableArray<Driver> = ko.observableArray([]);
    isAdmin: KnockoutObservable<boolean> = ko.observable(false);
    loggedIn: KnockoutObservable<boolean> = ko.observable(false);
    nameObservable: KnockoutObservable<string> = ko.observable("");
    logOutMessage: KnockoutObservable<string> = ko.observable(this.logOutText + this.nameObservable());
    logOutText: string = "Log out of ";
    pageContent: string = "page-content-div";
    pwObservable: KnockoutObservable<string> = ko.observable("");
    raceDropdown: string = "race-dropdown";
    races: KnockoutObservableArray<Race> = ko.observableArray([]);
    selectedRace: Race;
    sortedUsers: KnockoutObservableArray<User> = ko.observableArray([]);
    sortedDrivers: KnockoutObservableArray<Driver> = ko.observableArray([]);
    teams: KnockoutObservableArray<Team> = ko.observableArray([]);
    user: User;
    nextRaceId = ko.observable();
    modalVisible = ko.observable(false);
    modalText = ko.observable("");
    modalTitle = ko.observable("");
    modalOKText = ko.observable("");
    modalCancelText = ko.observable("");
    countdownText = ko.observable("");
    countdownValue = ko.observable("");
    errors = ko.observableArray<FWEDError>([]);
    adminMenu: KnockoutObservableArray<MenuItem> = ko.observableArray([
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


    constructor() {

    }

    initialize() {
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then((user: User) => {
                this.refreshUserInfo(user);
            }).catch((e) => {
                this.alert(e);
            });
        }
        this.currentPage.subscribe((page) => {
            this.loadPage(page);
        });
        this.currentPage("homepage");
        this.buildCountdown();
        ko.applyBindings(this);
    }

    buildCountdown() {
        FirebaseUtilities.getNextRace().then((race) => {
            this.countdownText("Cutoff for the " + race.title + ": ");
            setInterval(() => {
                var countdown;
                this.countdownValue((<any>moment()).countdown(race.cutoff).toString());
            }, 1000);
        }).catch((err) => { this.errors.push(err); });;
    }

    refreshUserInfo(user: User) {
        this.buildStandingsTable();
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        FirebaseUtilities.getRaces("2016").then((races) => {
            this.races(races);
        }).catch((err) => { this.errors.push(err); });
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.username());
    }

    doLogIn() {
        alert("here");
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then((user) => {
            this.refreshUserInfo(user);
        }).catch((err) => { this.errors.push(err); });
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


    logInProcedure(name, password): Promise<User> {
        this.credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(this.credentials).catch((err) => { this.errors.push(err); });
    }

    loadPage(page: string) {
        //if (this.loggedIn()) {
        //    window.localStorage.setItem(this.currentPageKey, page);
        //}


        var newPage: Page;

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

    launchAdminPage(item: MenuItem) {
        this.currentPage(item.binding);
    }
    launchUserPreferences() {
        this.currentPage("preferences");
    }

    launchRacePage(race: Race) {
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

    confirm(inString: string, title?: string, okText?: string, cancelText?: string, okCallback?: () => any, cancelCallback?: () => any) {
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        this.modalCancelText(cancelText || "Cancel");
        $("#confirm-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one(
            "click",
            "#modal-ok",
            () => {
                $("#confirm-modal").modal('hide');
                this.cleanUpModal();
                if (okCallback) {
                    okCallback();
                }
            }
        ).one(
            "click",
            "#modal-cancel",
            () => {
                this.cleanUpModal();
                if (cancelCallback) {
                    cancelCallback();
                }
            }
);
    }

    alert(inString: string, title?: string, okText?: string, callback?: () => any) {
        this.modalText(inString);
        this.modalTitle(title || "Formula Wednesday");
        this.modalOKText(okText || "OK");
        $("#alert-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        }).one(
            "click",
            "#modal-ok",
            () => {
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
}

window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
}