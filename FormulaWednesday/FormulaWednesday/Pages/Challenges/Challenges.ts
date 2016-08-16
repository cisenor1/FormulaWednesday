class ChallengesPage extends PageBase implements Page {
    originalChoices: RestUserPick[];
    vm: ChallengesVM = {
        challenges: ko.observableArray<Challenge>(),
        title: ko.observable<string>(),
        date: ko.observable<string>(),
        cutoff: ko.observable<string>(),
        save: () => { this.saveRaceData() },
        valid: ko.observable<boolean>(),
        reset: () => { this.reset() },
        change: (item: Challenge, e: Event) => { this.changed(item, event) },
        isDirty: ko.observable<boolean>(false),
        errorMessage: ko.observable<string>(),
        saveText: ko.observable("Save Changes")
    };
    markupUri: string = "Pages/Challenges/Challenges.html";
    divId = "challenges";

    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<ChallengesVM> {
        if (!this.app.user) {
            return Promise.resolve(null);
        }
        return new Promise<ChallengesVM>((resolve, reject) => {
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
            challenge.drivers.sort((aDriver: Driver, bDriver: Driver) => {
                var aName = aDriver.name;
                var bName = bDriver.name;
                return aName.localeCompare(bName);
            });
        });
    }

    sortDriversByTeam() {
        this.vm.challenges().forEach(challenge => {
            challenge.drivers.sort((aDriver: Driver, bDriver: Driver) => {
                var aTeam = aDriver.team;
                var bTeam = bDriver.team;
                return aTeam.localeCompare(bTeam);
            });
        });
    }

    processChoices(choices: RestUserPick[]): void {
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

    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }

    getViewModel(): Promise<any> {
        return this.vmPromise;
    }

    saveRaceData(): void {
        var userPicks = this.createUserPicks();
        RestUtilities.saveUserPicksForRace(this.app.selectedRace, this.app.user, userPicks)
            .then(success => {
                if (success) {
                    this.vm.isDirty(false);
                }
                else {
                    this.vm.errorMessage("Unknown error occurred");
                }
            }).catch((error: Error) => {
                this.vm.errorMessage(error.message);
            });
    }
    reset(): void {
        this.processChoices(this.originalChoices);
        this.vm.isDirty(false);
    }

    changed(item: Challenge, e) {
        this.vm.isDirty(true);
        var key = e.target.value;
        var driver = item.drivers().filter((d) => {
            return d.key === key;
        })[0];
        item.choice(driver);
    }

    createUserPicks(): RestUserPick[] {
        var userPicks: RestUserPick[] = [];

        this.vm.challenges().forEach(challenge => {
            if (challenge.choice()) {
                var userPick: RestUserPick = {
                    key: challenge.key(),
                    value: challenge.choice().key
                };
                userPicks.push(userPick);
            }
        });

        return userPicks;
    }

    createChallengesFromRest(restChallenges: RestChallenge[]): Challenge[] {
        var challenges: Challenge[] = [];

        restChallenges.forEach(restChallenge => {
            var drivers: Driver[] = [];
            restChallenge.driverChoices.forEach(restDriver => {
                var driver: Driver = {
                    active: restDriver.active > 0,
                    key: restDriver.key,
                    name: restDriver.name,
                    team: restDriver.teamName,
                    points: restDriver.points
                };
                drivers.push(driver);
            });

            drivers.sort((aDriver: Driver, bDriver: Driver) => {
                var aTeam = aDriver.team;
                var bTeam = bDriver.team;
                return aTeam.localeCompare(bTeam);
            });

            var challenge: Challenge = {
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

interface ChallengesVM extends ViewModelBase {
    date: KnockoutObservable<string>;
    cutoff: KnockoutObservable<string>;
    save: () => void;
    reset: () => void;
    valid: KnockoutObservable<boolean>;
    change: (Challenge, Event) => void;
    isDirty: KnockoutObservable<boolean>;
    errorMessage: KnockoutObservable<string>;
    saveText: KnockoutObservable<string>;
}