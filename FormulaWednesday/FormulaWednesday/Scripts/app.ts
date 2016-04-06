/// <reference path="../models/user.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
declare var md5;
class FormulaWednesdayApp {
    currentPage = ko.observable("header");
    nameObservable: KnockoutObservable<string> = ko.observable("");
    pwObservable: KnockoutObservable<string> = ko.observable("");
    loggedIn: KnockoutObservable<boolean> = ko.observable(false);
    credentialsKey: string = "formulawednesday.user";
    currentPageKey: string = "formulawednesday.page";
    credentials: Credentials;
    logOutText: string = "Log out of ";
    logOutMessage: KnockoutObservable<string> = ko.observable(this.logOutText + this.nameObservable());
    user: User;
    isAdmin: KnockoutObservable<boolean> = ko.observable(false);
    challenges: KnockoutObservableArray<Challenge> = ko.observableArray([]);
    drivers: KnockoutObservableArray<Driver> = ko.observableArray([]);
    teams: KnockoutObservableArray<Team> = ko.observableArray([]);
    pageContent: string = "page-content-div";

    constructor() {

    }

    initialize() {
        this.credentials = JSON.parse(window.localStorage.getItem(this.credentialsKey));
        var page = window.localStorage.getItem(this.currentPageKey);
        if (this.credentials) {
            this.logInProcedure(this.credentials.name, this.credentials.password).then((user: User) => {
                this.completeLogIn(user);
                if (page) {
                    this.currentPage(page);
                }
            });
        }

        this.currentPage.subscribe((page) => {
            this.loadPage(page);
        });
        ko.applyBindings(this);
    }

    completeLogIn(user: User) {
        window.localStorage.setItem(this.credentialsKey, JSON.stringify(this.credentials));
        this.loggedIn(true);
        this.user = user;
        this.isAdmin(user.role.toLowerCase() == "admin");
        this.logOutMessage(this.logOutText + user.name);
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
        this.loggedIn(false);
        this.isAdmin(false);
        this.nameObservable("");
        this.pwObservable("");
        this.launchHomepage();
    }

    logInProcedure(name, password): Promise<User> {
        var credentials = {
            name: name,
            password: password
        };
        return FirebaseUtilities.getUserInfo(credentials);
    }

    loadPage(page: string) {
        if (this.loggedIn()) {
            window.localStorage.setItem(this.currentPageKey, page);
        }

        var newPage: Page;

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

        newPage.getViewModel().then((vm) => {
            newPage.getMarkup().then((markup) => {
                var ele = document.getElementById(this.pageContent);
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
        this.currentPage("header");
    }

    launchAdmin() {
        if (this.user.role.toLowerCase() !== "admin") {
            return;
        }
        window.location.href = window.location.origin + "/admin.html";
    }

    launchChallenges() {
        this.currentPage('challenges');
    }
}

window.onload = function () {
    var formulawednesdayapp = new FormulaWednesdayApp();
    formulawednesdayapp.initialize();
}