var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HomePage = (function (_super) {
    __extends(HomePage, _super);
    function HomePage(app) {
        _super.call(this, app);
        this.vmPromise = this.createVM();
    }
    HomePage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
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
    HomePage.prototype.getMarkup = function () {
        return new Promise(function (resolve, reject) {
            resolve("");
        });
    };
    HomePage.prototype.getViewModel = function () {
        return new Promise(function (resolve, reject) {
            resolve({});
        });
    };
    return HomePage;
})(PageBase);
