class RacesAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Races.html";
    divId: string = "races-admin";
    races: KnockoutObservableArray<Race> = ko.observableArray([]);
    challenges: KnockoutObservableArray<Challenge> = ko.observableArray([]);
    showValidateRacePane = ko.observable(false);
    editing = ko.observable(false);
    drivers = ko.observableArray([]);
    currentRace: KnockoutObservable<Race>;

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getRaces().then((values) => {
                this.races(values);
                this.currentRace = ko.observable(values[0]);
                this.races().forEach((r) => {
                    r.done = ko.observable(r.cutoff < new Date(Date.now()));
                    r.date = <any>ko.observable(r.date.toDateString());
                    r.validating = ko.observable(false);
                });
                FirebaseUtilities.getChallenges().then((c) => {
                    this.challenges(c);
                });
                FirebaseUtilities.getDrivers().then((d) => {
                    this.drivers(d);
                });
                resolve(this);
            });
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

    submitValidateRace(race: Race, vm: RacesAdmin) {
        race.validating(false);
        FirebaseUtilities.setRaceResults(race).then((r) => {
            var self = vm;
            vm.app.sortedUsers().forEach((u) => {
                debugger;
                var results = r.results;
                var chals = self.challenges();
                if (!u.results) {
                    return;
                }
                var season = u.results[r.season];
                if (!season) {
                    return;
                }
                var picks = u.results[r.season][r.name];
                if (picks) {
                    for (var p in picks) {
                        var currentChal = chals.filter((c) => {
                            return c.key = p;
                        })[0];
                        var win = r.results[p];
                        var picked = picks[p];
                        if (win == picked) {
                            var currPts = u.points();
                            currPts += currentChal.value();
                            u.points(currPts);
                        }
                    }
                    FirebaseUtilities.setPoints(u);
                }
            });
        });
    }

    cancelValidate(race: Race) {
        race.validating(false);
    }

    validateRace(race: Race) {
        this.currentRace(race);
        race.validating(true);
    }

    change(challenge: Challenge, race: Race, e, vm: RacesAdmin) {
        var driverKey = e.target.value;
        var currRace = vm.currentRace()
        if (!currRace.results) {
            currRace.results = [];
        }
        var key = challenge.key();
        currRace.results[challenge.key()] = driverKey;
        vm.currentRace(currRace);
    }
}