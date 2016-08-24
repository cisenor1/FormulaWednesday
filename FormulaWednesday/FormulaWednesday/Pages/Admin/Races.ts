class RacesAdmin extends PageBase implements Page {

    races = ko.observableArray([]);
    selectedRace = ko.observable(null);
    markupUri: string = "Pages/Admin/Races.html";
    modalOkText = ko.observable("OK");
    modalCancelText = ko.observable("Cancel");
    challenges: KnockoutObservableArray<AdminChallenge> = ko.observableArray([]);
    allDrivers = ko.observableArray([]);
    showEditChallengesForRace = ko.observable(false);
    showAddChallengePane = ko.observable(false);
    // Variables for challenge edit in modal
    messageoverride = ko.observable("");
    valueoverride = ko.observable(0);
    descriptionoverride = ko.observable("");
    useAllActiveDrivers = ko.observable(true);
    selectedDrivers = ko.observableArray([]);
    finalChoice: KnockoutObservable<Driver> = ko.observable(null);
    challengeIndex = -1;
    // End variables

    editing = ko.observable(false);
    cachedChallenge: Challenge;
    newChallengeName = ko.observable("");
    newChallengeKey = ko.observable("");
    newPointValue = ko.observable(2);
    roles = ["admin", "user"];
    role = ko.observable("");

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            let promises = [];
            promises.push(RestUtilities.getRaces("2016"));
            promises.push(RestUtilities.getAllChallenges());
            promises.push(RestUtilities.getDrivers(true));
            Promise.all(promises).then(values => {
                let races: Race[] = values[0];
                let allRestChallenges: RestChallenge[] = values[1];
                let allDrivers: Driver[] = values[2];
                this.races(races);
                allDrivers.forEach(driver => {
                    this.allDrivers.push(driver);
                });
                allRestChallenges.forEach(restChallenge => {
                    let adminChallenge: AdminChallenge = {
                        description: ko.observable(restChallenge.description),
                        descriptionoverride: ko.observable(restChallenge.description),
                        key: ko.observable(restChallenge.key),
                        unSelectedDrivers: ko.observableArray([]),
                        selectedDrivers: ko.observableArray([]),
                        selected: ko.observable(false),
                        message: ko.observable(restChallenge.message),
                        messageoverride: ko.observable(restChallenge.message),
                        useAllActiveDrivers: ko.observable(true),
                        value: ko.observable(restChallenge.value),
                        valueoverride: ko.observable(restChallenge.value),
                        editing: ko.observable(false),
                        finalChoice: ko.observable(null)
                    }
                    this.allDrivers().forEach(driver => {
                        adminChallenge.unSelectedDrivers.push(driver);
                    });
                    adminChallenge.unSelectedDrivers.sort((a, b) => {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                    this.challenges.push(adminChallenge);
                });

                resolve(this);
            });
        });
    }

    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                return value.text();
            }).then(output => {
                resolve(output);
            });
        });
    }

    getViewModel(): Promise<any> {
        return this.vmPromise;
    }

    raceChange() {
        let thisRace = this.selectedRace();
        let promises = [];
        promises.push(RestUtilities.getChallengesForRace(thisRace));

        Promise.all(promises).then(outputs => {
            let restChallenges: RestChallenge[] = outputs[0];
            restChallenges.forEach(restChallenge => {
                let adminChallenge: AdminChallenge = this.challenges().filter((adminChallenge: AdminChallenge) => {
                    return adminChallenge.key() == restChallenge.key;
                })[0];
                if (adminChallenge) {
                    adminChallenge.selected(true);
                    adminChallenge.descriptionoverride(restChallenge.description);
                    adminChallenge.messageoverride(restChallenge.message);
                    adminChallenge.valueoverride(restChallenge.value);
                    adminChallenge.useAllActiveDrivers(restChallenge.driverChoices.length == this.allDrivers().length);
                    
                    if (!adminChallenge.useAllActiveDrivers()) {
                        restChallenge.driverChoices.forEach(restDriver => {
                            let driver = adminChallenge.unSelectedDrivers().filter(driver => {
                                return driver.key == restDriver.key;
                            })[0];
                            if (driver) {
                                adminChallenge.selectedDrivers.push(driver);
                            }
                        });
                    }
                }
            });
            this.showEditChallengesForRace(true);
        }).catch(error => {
            this.app.alert(error);
        });
    }
    
    addChallenge() {
        this.showAddChallengePane(true);
    }

    editChallenge(index) {
        this.challengeIndex = index;
        let adminChallenge = this.challenges()[index];
        this.messageoverride(adminChallenge.messageoverride());
        this.descriptionoverride(adminChallenge.descriptionoverride());
        this.valueoverride(adminChallenge.valueoverride());
        this.useAllActiveDrivers(adminChallenge.useAllActiveDrivers());
        this.selectedDrivers.removeAll();

        adminChallenge.selectedDrivers().forEach(driver => {
            this.selectedDrivers.push(driver);
        });

        $("#race-challenge-modal").modal({
            backdrop: "static",
            show: true,
            keyboard: false
        })
            .one("click", "#challenge-cancel", () => {
                $("#race-challenge-modal").modal('hide');
            });
    }

    // We need to apply any changes back to the selected challenge.
    applyChallengeEdit() {
        $("#race-challenge-modal").modal('hide');
        let index = this.challengeIndex;
        let adminChallenge = this.challenges()[index];
        adminChallenge.messageoverride(this.messageoverride());
        adminChallenge.descriptionoverride(this.descriptionoverride());
        adminChallenge.valueoverride(this.valueoverride());
        adminChallenge.useAllActiveDrivers(this.useAllActiveDrivers());
        adminChallenge.selectedDrivers.removeAll();

        this.selectedDrivers().forEach(driver => {
            adminChallenge.selectedDrivers.push(driver);
        });
    }

    submitCreateChallenge() {

    }
}

interface AdminChallenge {
    key: KnockoutObservable<string>;
    message: KnockoutObservable<string>;
    messageoverride: KnockoutObservable<string>;
    value: KnockoutObservable<number>;
    valueoverride: KnockoutObservable<number>;
    description: KnockoutObservable<string>;
    descriptionoverride: KnockoutObservable<string>;
    selected: KnockoutObservable<boolean>;
    useAllActiveDrivers: KnockoutObservable<boolean>;
    editing: KnockoutObservable<boolean>;
    selectedDrivers: KnockoutObservableArray<Driver>;
    unSelectedDrivers: KnockoutObservableArray<Driver>;
    finalChoice: KnockoutObservable<Driver>;
}