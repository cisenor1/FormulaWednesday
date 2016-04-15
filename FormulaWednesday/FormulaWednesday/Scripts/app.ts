/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
declare var md5;
class FormulaWednesdayApp {
    currentPage = ko.observable("homepage");
    nameObservable: KnockoutObservable<string> = ko.observable("");
    pwObservable: KnockoutObservable<string> = ko.observable("");
    loggedIn: KnockoutObservable<boolean> = ko.observable(false);
    credentialsKey: string = "formulawednesday.user";
    currentPageKey: string = "formulawednesday.page";
    currentRaceKey: string = "formulawednesday.race";
    credentials: Credentials;
    logOutText: string = "Log out of ";
    logOutMessage: KnockoutObservable<string> = ko.observable(this.logOutText + this.nameObservable());
    user: User;
    isAdmin: KnockoutObservable<boolean> = ko.observable(false);
    challenges: KnockoutObservableArray<Challenge> = ko.observableArray([]);
    drivers: KnockoutObservableArray<Driver> = ko.observableArray([]);
    teams: KnockoutObservableArray<Team> = ko.observableArray([]);
    races: KnockoutObservableArray<Race> = ko.observableArray([]);
    pageContent: string = "page-content-div";
    raceDropdown: string = "race-dropdown";
    selectedRace: Race;
    adminDropdown: string = "admin-dropdown";
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
        }
    ]);


    constructor() {

    }

    initialize() {
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        var page = window.localStorage.getItem(this.currentPageKey);
        var r = window.localStorage.getItem(this.currentRaceKey);
        var race;
        if (r !== "undefined") {
           race = JSON.parse(r);
        }
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then((user: User) => {
                this.completeLogIn(user);
                if (page) {
                    this.currentPage(page);
                }
                if (race && race != "undefined") {
                    this.selectedRace = race;
                    this.selectedRace.date = new Date(Date.parse(<any>this.selectedRace.date));
                    this.selectedRace.cutoff = new Date(Date.parse(<any>this.selectedRace.cutoff));
                    this.selectedRace.done = ko.observable(this.selectedRace.date < new Date(Date.now()));
                    window.localStorage.setItem(this.currentRaceKey, JSON.stringify(this.selectedRace));
                }
            });
        }

        this.currentPage.subscribe((page) => {
            this.loadPage(page);
        });
        FirebaseUtilities.getRaces().then((races) => {
            this.races(races);
        });
        ko.applyBindings(this);
    }

    completeLogIn(user: User) {
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        this.isAdmin(user.role().toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.username());
    }

    doLogIn() {
        if (!this.nameObservable()) {
            return;
        }
        var hashed = md5(this.pwObservable());
        this.logInProcedure(this.nameObservable(), hashed).then((user) => {
            this.completeLogIn(user);
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

    logInProcedure(name, password): Promise<User> {
        this.credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(this.credentials);
    }

    loadPage(page: string) {
        if (this.loggedIn()) {
            window.localStorage.setItem(this.currentPageKey, page);
        }

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
}

window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
}