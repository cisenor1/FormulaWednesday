var PageBase = (function () {
    function PageBase(app) {
        this.app = app;
    }
    PageBase.prototype.createVM = function () {
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
    PageBase.prototype.sortDriversByName = function () {
        this.vm.drivers.sort(function (aDriver, bDriver) {
            var aName = aDriver.name;
            var bName = bDriver.name;
            return aName.localeCompare(bName);
        });
    };
    PageBase.prototype.sortDriversByTeam = function () {
        this.vm.drivers.sort(function (aDriver, bDriver) {
            var aTeam = aDriver.team;
            var bTeam = bDriver.team;
            return aTeam.localeCompare(bTeam);
        });
    };
    return PageBase;
})();
