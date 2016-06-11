class RacesAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Admin/Races.html";
        this.divId = "races-admin";
        this.races = ko.observableArray([]);
        this.challenges = ko.observableArray([]);
        this.showValidateRacePane = ko.observable(false);
        this.editing = ko.observable(false);
        this.drivers = ko.observableArray([]);
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            FirebaseUtilities.getRaces("2016").then((values) => {
                this.races(values);
                this.currentRace = ko.observable(values[0]);
                this.races().forEach((r) => {
                    r.done = ko.observable(r.cutoff < new Date(Date.now()));
                    r.date = ko.observable(r.date.toDateString());
                    r.validating = ko.observable(false);
                });
                FirebaseUtilities.getDrivers().then((ds) => {
                    this.drivers(ds);
                });
                resolve(this);
            });
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
    submitValidateRace(race, vm) {
        race.validating(false);
        FirebaseUtilities.setRaceResults(race).then((r) => {
            var self = vm;
            vm.app.sortedUsers().forEach((u) => {
                var results = r.results;
                var chals = r.challenges();
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
                            return c.key() == p;
                        })[0];
                        if (!currentChal) {
                            return;
                        }
                        var win = r.results[p];
                        var picked = picks[p];
                        if (win == picked) {
                            var currPts = u.points();
                            currPts += currentChal.value();
                            u.points(currPts);
                        }
                    }
                    FirebaseUtilities.setPoints(u).then(() => {
                        this.updateDriverStandings();
                    });
                }
            });
        });
    }
    cancelValidate(race) {
        race.validating(false);
    }
    validateRace(race) {
        this.currentRace(race);
        this.races().forEach((x) => {
            if (x.validating) {
                x.validating(false);
            }
        });
        race.validating(true);
    }
    updateDriverStandings() {
    }
    change(challenge, race, e, vm) {
        var driverKey = e.target.value;
        var currRace = vm.currentRace();
        if (!currRace.results) {
            currRace.results = [];
        }
        var key = challenge.key();
        currRace.results[challenge.key()] = driverKey;
        vm.currentRace(currRace);
    }
}
