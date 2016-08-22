class RacesAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.races = ko.observableArray([]);
        this.selectedRace = ko.observable(null);
        this.markupUri = "Pages/Admin/Races.html";
        this.challenges = ko.observableArray([]);
        this.showAddChallengePane = ko.observable(false);
        this.showEditChallengesForRace = ko.observable(false);
        this.editing = ko.observable(false);
        this.newChallengeName = ko.observable("");
        this.newChallengeKey = ko.observable("");
        this.newPointValue = ko.observable(2);
        this.roles = ["admin", "user"];
        this.role = ko.observable("");
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            let promises = [];
            promises.push(RestUtilities.getRaces("2016"));
            promises.push(RestUtilities.getAllChallenges());
            promises.push(RestUtilities.getDrivers(true));
            Promise.all(promises).then(values => {
                let races = values[0];
                let allRestChallenges = values[1];
                let allDrivers = values[2];
                this.races(races);
                this.allDrivers = allDrivers;
                allRestChallenges.forEach(restChallenge => {
                    let adminChallenge = {
                        allSeason: ko.observable(true),
                        description: ko.observable(restChallenge.description),
                        key: ko.observable(restChallenge.key),
                        drivers: ko.observableArray([]),
                        selected: ko.observable(false),
                        message: ko.observable(restChallenge.message),
                        useAllActiveDrivers: ko.observable(true),
                        value: ko.observable(restChallenge.value),
                        editing: ko.observable(false)
                    };
                    this.challenges.push(adminChallenge);
                });
                resolve(this);
            });
        });
    }
    getMarkup() {
        return new Promise((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                return value.text();
            }).then(output => {
                resolve(output);
            });
        });
    }
    getViewModel() {
        return this.vmPromise;
    }
    raceChange() {
        let thisRace = this.selectedRace();
        let promises = [];
        promises.push(RestUtilities.getChallengesForRace(thisRace));
        Promise.all(promises).then(outputs => {
            let restChallenges = outputs[0];
            debugger;
            restChallenges.forEach(restChallenge => {
                let adminChallenge = this.challenges().filter((adminChallenge) => {
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
