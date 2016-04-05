var ChallengesPage = (function () {
    // constructor will do heavy lifting
    function ChallengesPage(app) {
        this.vm = {
            drivers: ko.observableArray(),
            teams: ko.observableArray(),
            challenges: ko.observableArray(),
            sortDriversByName: this.sortDriversByName,
            sortDriversByTeam: this.sortDriversByTeam
        };
        this.markupUri = "Pages/Challenges/Challenges.html";
        this.app = app;
        this.createVM();
    }
    ChallengesPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        this.vmPromise = new Promise(function (resolve, reject) {
            var promises = [];
            promises.push(FirebaseUtilities.getChallenges());
            promises.push(FirebaseUtilities.getTeams());
            promises.push(FirebaseUtilities.getDrivers());
            Promise.all(promises).then(function (values) {
                _this.vm.challenges(values[0]);
                _this.vm.teams(values[1]);
                _this.vm.drivers(values[2]);
                resolve(_this.vm);
            });
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
    return ChallengesPage;
})();
//# sourceMappingURL=Challenges.js.map