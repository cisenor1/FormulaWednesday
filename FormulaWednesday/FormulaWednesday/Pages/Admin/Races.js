var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RacesAdmin = (function (_super) {
    __extends(RacesAdmin, _super);
    function RacesAdmin(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Races.html";
        this.divId = "races-admin";
        this.races = ko.observableArray([]);
        this.challenges = ko.observableArray([]);
        this.showValidateRacePane = ko.observable(false);
        this.editing = ko.observable(false);
        this.drivers = ko.observableArray([]);
        this.vmPromise = this.createVM();
    }
    RacesAdmin.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            FirebaseUtilities.getRaces("2016").then(function (values) {
                _this.races(values);
                _this.currentRace = ko.observable(values[0]);
                _this.races().forEach(function (r) {
                    r.done = ko.observable(r.cutoff < new Date(Date.now()));
                    r.date = ko.observable(r.date.toDateString());
                    r.validating = ko.observable(false);
                });
                FirebaseUtilities.getDrivers().then(function (ds) {
                    _this.drivers(ds);
                });
                resolve(_this);
            });
        });
    };
    RacesAdmin.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    RacesAdmin.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    RacesAdmin.prototype.submitValidateRace = function (race, vm) {
        var _this = this;
        race.validating(false);
        FirebaseUtilities.setRaceResults(race).then(function (r) {
            var self = vm;
            vm.app.sortedUsers().forEach(function (u) {
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
                        var currentChal = chals.filter(function (c) {
                            return c.key = p;
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
                    FirebaseUtilities.setPoints(u).then(function () {
                        _this.updateDriverStandings();
                    });
                }
            });
        });
    };
    RacesAdmin.prototype.cancelValidate = function (race) {
        race.validating(false);
    };
    RacesAdmin.prototype.validateRace = function (race) {
        this.currentRace(race);
        this.races().forEach(function (x) {
            if (x.validating) {
                x.validating(false);
            }
        });
        race.validating(true);
    };
    RacesAdmin.prototype.updateDriverStandings = function () {
    };
    RacesAdmin.prototype.change = function (challenge, race, e, vm) {
        var driverKey = e.target.value;
        var currRace = vm.currentRace();
        if (!currRace.results) {
            currRace.results = [];
        }
        var key = challenge.key();
        currRace.results[challenge.key()] = driverKey;
        vm.currentRace(currRace);
    };
    return RacesAdmin;
})(PageBase);
