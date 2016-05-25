var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ChallengesPage = (function (_super) {
    __extends(ChallengesPage, _super);
    // constructor will do heavy lifting
    function ChallengesPage(app) {
        var _this = this;
        _super.call(this, app);
        this.vm = {
            drivers: ko.observableArray(),
            teams: ko.observableArray(),
            challenges: ko.observableArray(),
            sortDriversByName: function () { _this.sortDriversByName(); },
            sortDriversByTeam: function () { _this.sortDriversByTeam(); },
            title: ko.observable(),
            date: ko.observable(),
            cutoff: ko.observable(),
            save: function () { _this.saveRaceData(); },
            valid: ko.observable(),
            reset: function () { _this.reset(); },
            change: function (item, e) { _this.changed(item, event); },
            isDirty: ko.observable(false),
            errorMessage: ko.observable()
        };
        this.markupUri = "Pages/Challenges/Challenges.html";
        this.divId = "challenges";
        this.vmPromise = this.createVM();
    }
    ChallengesPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            var promises = [];
            promises.push(FirebaseUtilities.getChallengesForRace(_this.app.selectedRace));
            promises.push(FirebaseUtilities.getTeams());
            promises.push(FirebaseUtilities.getDrivers());
            promises.push(FirebaseUtilities.getUserChoices(_this.app.user));
            Promise.all(promises).then(function (values) {
                _this.vm.challenges(values[0]);
                _this.vm.teams(values[1]);
                _this.vm.drivers(values[2]);
                if (_this.app.selectedRace) {
                    _this.vm.title(_this.app.selectedRace.title);
                    _this.vm.date(_this.app.selectedRace.date.toDateString());
                    _this.vm.cutoff(_this.app.selectedRace.cutoff.toDateString());
                    _this.vm.valid(!_this.app.selectedRace.done());
                    _this.originalChoices = values[3];
                    _this.processChoices(_this.originalChoices);
                }
                resolve(_this.vm);
            });
        });
    };
    ChallengesPage.prototype.sortDriversByName = function () {
        this.vm.drivers.sort(function (aDriver, bDriver) {
            var aName = aDriver.name;
            var bName = bDriver.name;
            return aName.localeCompare(bName);
        });
    };
    ChallengesPage.prototype.sortDriversByTeam = function () {
        this.vm.drivers.sort(function (aDriver, bDriver) {
            var aTeam = aDriver.team;
            var bTeam = bDriver.team;
            return aTeam.localeCompare(bTeam);
        });
    };
    ChallengesPage.prototype.processChoices = function (choices) {
        var _this = this;
        if (!choices) {
            return;
        }
        var targetChoices = choices[this.app.selectedRace.name];
        if (!targetChoices) {
            return;
        }
        this.vm.challenges().forEach(function (challenge) {
            var choices = _this.vm.drivers().filter(function (driver) {
                return driver.key == targetChoices[challenge.key()];
            });
            challenge.choice(choices[0]);
            //challenge.choice(targetChoices[challenge.key]);
        });
    };
    ChallengesPage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    ChallengesPage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    ChallengesPage.prototype.saveRaceData = function () {
        var _this = this;
        var race = this.app.selectedRace;
        var challenges = this.createChallengeObject();
        FirebaseUtilities.saveChallengeChoices(this.app.user, this.app.selectedRace, challenges)
            .then(function (b) {
            _this.vm.isDirty(false);
        })
            .catch(function (e) {
            _this.vm.errorMessage(e.message);
        });
    };
    ChallengesPage.prototype.reset = function () {
        this.processChoices(this.originalChoices);
    };
    ChallengesPage.prototype.changed = function (item, e) {
        this.vm.isDirty(true);
        var key = e.target.value;
        var driver = this.vm.drivers().filter(function (d) {
            return d.key === key;
        })[0];
        item.choice(driver);
    };
    ChallengesPage.prototype.createChallengeObject = function () {
        var o = {};
        this.vm.challenges().forEach(function (c) {
            if (c.choice()) {
                if (c.choice().key) {
                    o[c.key()] = c.choice().key;
                }
            }
        });
        return o;
    };
    return ChallengesPage;
})(PageBase);
