var PageBase = (function () {
    function PageBase(app) {
        this.app = app;
    }
    PageBase.prototype.createVM = function () {
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
