class ChallengesPage extends PageBase implements Page {
    originalChoices: any;
    vm: ChallengesVM = {
        drivers: ko.observableArray<Driver>(),
        teams: ko.observableArray<Team>(),
        challenges: ko.observableArray<Challenge>(),
        sortDriversByName: () => { this.sortDriversByName(); },
        sortDriversByTeam: () => { this.sortDriversByTeam(); },
        title: ko.observable<string>(),
        date: ko.observable<string>(),
        cutoff: ko.observable<string>(),
        save: () => { this.saveRaceData() },
        valid: ko.observable<boolean>(),
        reset: () => { this.reset() },
        change: (item: Challenge, e: Event) => { this.changed(item, event) },
        isDirty: ko.observable<boolean>(false),
        errorMessage: ko.observable<string>()
    };
    markupUri: string = "Pages/Challenges/Challenges.html";
    divId = "challenges";

    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            var promises = [];
            promises.push(RestUtilities.getChallengesForRace(this.app.selectedRace));
            promises.push(FirebaseUtilities.getTeams());
            promises.push(FirebaseUtilities.getDrivers());
            promises.push(FirebaseUtilities.getUserChoices(this.app.user));
            Promise.all(promises).then((values) => {
                this.vm.challenges(<any>values[0]);
                this.vm.teams(<any>values[1]);
                this.vm.drivers(<any>values[2]);
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
        this.vm.drivers.sort((aDriver: Driver, bDriver: Driver) => {
            var aName = aDriver.name;
            var bName = bDriver.name;
            return aName.localeCompare(bName);
        });
    }

    sortDriversByTeam() {
        this.vm.drivers.sort((aDriver: Driver, bDriver: Driver) => {
            var aTeam = aDriver.team;
            var bTeam = bDriver.team;
            return aTeam.localeCompare(bTeam);
        });
    }

    processChoices(choices): void {
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
    reset(): void {
        this.processChoices(this.originalChoices);
    }

    changed(item: Challenge, e) {
        this.vm.isDirty(true);
        var key = e.target.value;
        var driver = this.vm.drivers().filter((d) => {
            return d.key === key;
        })[0];
        item.choice(driver);
    }

    createChallengeObject(): Object {
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

interface ChallengesVM extends ViewModelBase {
    date: KnockoutObservable<string>;
    cutoff: KnockoutObservable<string>;
    save: () => void;
    reset: () => void;
    valid: KnockoutObservable<boolean>;
    change: (Challenge, Event) => void;
    isDirty: KnockoutObservable<boolean>;
    errorMessage: KnockoutObservable<string>;
}