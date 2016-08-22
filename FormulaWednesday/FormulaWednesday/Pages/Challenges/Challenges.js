class ChallengesPage extends PageBase {
    // constructor will do heavy lifting
    constructor(app) {
        super(app);
        this.vm = {
            challenges: ko.observableArray(),
            title: ko.observable(),
            date: ko.observable(),
            cutoff: ko.observable(),
            save: () => { this.saveRaceData(); },
            valid: ko.observable(),
            reset: () => { this.reset(); },
            change: (item, e) => { this.changed(item, event); },
            isDirty: ko.observable(false),
            errorMessage: ko.observable(),
            saveText: ko.observable("Save Changes")
        };
        this.markupUri = "Pages/Challenges/Challenges.html";
        this.divId = "challenges";
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return Promise.resolve(null);
        }
        return new Promise((resolve, reject) => {
            var promises = [];
            promises.push(RestUtilities.getChallengesForRace(this.app.selectedRace));
            promises.push(RestUtilities.getUserPicksForRace(this.app.selectedRace, this.app.user));
            Promise.all(promises).then((values) => {
                var challenges = this.createChallengesFromRest(values[0]);
                this.vm.challenges(challenges);
                if (this.app.selectedRace) {
                    this.vm.title(this.app.selectedRace.title);
                    this.vm.date(this.app.selectedRace.date.toDateString());
                    this.vm.cutoff(this.app.selectedRace.cutoff.toDateString());
                    this.vm.valid(!this.app.selectedRace.done());
                    this.originalChoices = values[1];
                    this.processChoices(this.originalChoices);
                }
                resolve(this.vm);
            });
        });
    }
    sortDriversByName() {
        this.vm.challenges().forEach(challenge => {
            challenge.drivers.sort((aDriver, bDriver) => {
                var aName = aDriver.name;
                var bName = bDriver.name;
                return aName.localeCompare(bName);
            });
        });
    }
    sortDriversByTeam() {
        this.vm.challenges().forEach(challenge => {
            challenge.drivers.sort((aDriver, bDriver) => {
                var aTeam = aDriver.team;
                var bTeam = bDriver.team;
                return aTeam.localeCompare(bTeam);
            });
        });
    }
    processChoices(choices) {
        if (!choices) {
            return;
        }
        this.vm.challenges().forEach((challenge) => {
            let userPick = choices.filter(restUserPick => {
                return restUserPick.key === challenge.key();
            })[0];
            if (!!userPick) {
                let challengeChoice = challenge.drivers().filter(driver => {
                    return driver.key === userPick.value;
                })[0];
                challenge.choice(challengeChoice);
            }
            else {
                challenge.choice(null);
            }
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
        var userPicks = this.createUserPicks();
        RestUtilities.saveUserPicksForRace(this.app.selectedRace, this.app.user, userPicks)
            .then(success => {
            if (success) {
                this.vm.isDirty(false);
                this.app.alert("Save was successful", "Save");
            }
            else {
                this.vm.errorMessage("Unknown error occurred");
            }
        }).catch((error) => {
            this.app.alert(error.message, "Save");
        });
    }
    reset() {
        this.processChoices(this.originalChoices);
        this.vm.isDirty(false);
    }
    changed(item, e) {
        this.vm.isDirty(true);
        var key = e.target.value;
        var driver = item.drivers().filter((d) => {
            return d.key === key;
        })[0];
        item.choice(driver);
    }
    createUserPicks() {
        var userPicks = [];
        this.vm.challenges().forEach(challenge => {
            if (challenge.choice()) {
                var userPick = {
                    key: challenge.key(),
                    value: challenge.choice().key
                };
                userPicks.push(userPick);
            }
        });
        return userPicks;
    }
    createChallengesFromRest(restChallenges) {
        var challenges = [];
        restChallenges.forEach(restChallenge => {
            var drivers = [];
            restChallenge.driverChoices.forEach(restDriver => {
                var driver = {
                    active: restDriver.active,
                    key: restDriver.key,
                    name: restDriver.name,
                    team: restDriver.teamName,
                    points: restDriver.points
                };
                drivers.push(driver);
            });
            drivers.sort((aDriver, bDriver) => {
                var aTeam = aDriver.team;
                var bTeam = bDriver.team;
                return aTeam.localeCompare(bTeam);
            });
            var challenge = {
                allSeason: ko.observable(true),
                choice: ko.observable(null),
                description: ko.observable(restChallenge.description),
                drivers: ko.observableArray(drivers),
                editing: ko.observable(false),
                key: ko.observable(restChallenge.key),
                message: ko.observable(restChallenge.message),
                type: ko.observable(restChallenge.type),
                value: ko.observable(restChallenge.value)
            };
            challenges.push(challenge);
        });
        return challenges;
    }
}
