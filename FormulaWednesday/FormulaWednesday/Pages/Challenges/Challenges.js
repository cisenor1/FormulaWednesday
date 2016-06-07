class ChallengesPage extends PageBase {
    // constructor will do heavy lifting
    constructor(app) {
        super(app);
        this.vm = {
            drivers: ko.observableArray(),
            teams: ko.observableArray(),
            challenges: ko.observableArray(),
            sortDriversByName: () => { this.sortDriversByName(); },
            sortDriversByTeam: () => { this.sortDriversByTeam(); },
            title: ko.observable(),
            date: ko.observable(),
            cutoff: ko.observable(),
            save: () => { this.saveRaceData(); },
            valid: ko.observable(),
            reset: () => { this.reset(); },
            change: (item, e) => { this.changed(item, event); },
            isDirty: ko.observable(false),
            errorMessage: ko.observable()
        };
        this.markupUri = "Pages/Challenges/Challenges.html";
        this.divId = "challenges";
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            var promises = [];
            promises.push(FirebaseUtilities.getChallengesForRace(this.app.selectedRace));
            promises.push(FirebaseUtilities.getTeams());
            promises.push(FirebaseUtilities.getDrivers());
            promises.push(FirebaseUtilities.getUserChoices(this.app.user));
            Promise.all(promises).then((values) => {
                this.vm.challenges(values[0]);
                this.vm.teams(values[1]);
                this.vm.drivers(values[2]);
                if (this.app.selectedRace) {
                    this.vm.title(this.app.selectedRace.title);
                    this.vm.date(this.app.selectedRace.date.toDateString());
                    this.vm.cutoff(this.app.selectedRace.cutoff.toDateString());
                    this.vm.valid(!this.app.selectedRace.done());
                    this.originalChoices = values[3];
                    this.processChoices(this.originalChoices);
                }
                resolve(this.vm);
            });
        });
    }
    sortDriversByName() {
        this.vm.drivers.sort((aDriver, bDriver) => {
            var aName = aDriver.name;
            var bName = bDriver.name;
            return aName.localeCompare(bName);
        });
    }
    sortDriversByTeam() {
        this.vm.drivers.sort((aDriver, bDriver) => {
            var aTeam = aDriver.team;
            var bTeam = bDriver.team;
            return aTeam.localeCompare(bTeam);
        });
    }
    processChoices(choices) {
        if (!choices) {
            return;
        }
        var targetChoices = choices[this.app.selectedRace.name];
        if (!targetChoices) {
            return;
        }
        this.vm.challenges().forEach((challenge) => {
            var choices = this.vm.drivers().filter((driver) => {
                return driver.key == targetChoices[challenge.key()];
            });
            challenge.choice(choices[0]);
            //challenge.choice(targetChoices[challenge.key]);
        });
    }
    getMarkup() {
        return new Promise((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }
    getViewModel() {
        return this.vmPromise;
    }
    saveRaceData() {
        var race = this.app.selectedRace;
        var challenges = this.createChallengeObject();
        FirebaseUtilities.saveChallengeChoices(this.app.user, this.app.selectedRace, challenges)
            .then((b) => {
            this.vm.isDirty(false);
        })
            .catch((e) => {
            this.vm.errorMessage(e.message);
        });
    }
    reset() {
        this.processChoices(this.originalChoices);
    }
    changed(item, e) {
        this.vm.isDirty(true);
        var key = e.target.value;
        var driver = this.vm.drivers().filter((d) => {
            return d.key === key;
        })[0];
        item.choice(driver);
    }
    createChallengeObject() {
        var o = {};
        this.vm.challenges().forEach((c) => {
            if (c.choice()) {
                if (c.choice().key) {
                    o[c.key()] = c.choice().key;
                }
            }
        });
        return o;
    }
}
