class RacesAdmin extends PageBase implements Page {

    races = ko.observableArray([]);
    selectedRace = ko.observable(null);
    markupUri: string = "Pages/Admin/Races.html";
    challenges = ko.observableArray([]);
    allDrivers: Driver[];
    showAddChallengePane = ko.observable(false);
    showEditChallengesForRace = ko.observable(false);
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
                this.allDrivers = allDrivers;
                allRestChallenges.forEach(restChallenge => {
                    let adminChallenge: AdminChallenge = {
                        allSeason: ko.observable(true),
                        description: ko.observable(restChallenge.description),
                        key: ko.observable(restChallenge.key),
                        drivers: ko.observableArray([]),
                        selected: ko.observable(false),
                        message: ko.observable(restChallenge.message),
                        useAllActiveDrivers: ko.observable(true),
                        value: ko.observable(restChallenge.value),
                        editing: ko.observable(false)
                    }
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
            debugger;
            restChallenges.forEach(restChallenge => {
                let adminChallenge: AdminChallenge = this.challenges().filter((adminChallenge: AdminChallenge) => {
                    return adminChallenge.key() == restChallenge.key;
                })[0];
                if (adminChallenge) {
                    adminChallenge.selected(true);
                    adminChallenge.useAllActiveDrivers(restChallenge.driverChoices.length == this.allDrivers.length);
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

    editChallenge(item) {
    }

    submitCreateChallenge() {

    }
}

interface AdminChallenge {
    key: KnockoutObservable<string>;
    message: KnockoutObservable<string>;
    value: KnockoutObservable<number>;
    description: KnockoutObservable<string>;
    selected: KnockoutObservable<boolean>;
    useAllActiveDrivers: KnockoutObservable<boolean>;
    allSeason?: KnockoutObservable<boolean>;
    editing?: KnockoutObservable<boolean>;
    drivers?: KnockoutObservableArray<Driver>;
    finalChoice?: KnockoutObservable<Driver>;
}