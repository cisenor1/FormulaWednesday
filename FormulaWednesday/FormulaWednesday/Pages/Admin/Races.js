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
            FirebaseUtilities.getRaces().then(function (values) {
                _this.races(values);
                _this.races().forEach(function (r) {
                    r.done = ko.observable(r.cutoff < new Date(Date.now()));
                    r.date = ko.observable(r.date.toDateString());
                    r.validating = ko.observable(false);
                });
                FirebaseUtilities.getChallenges().then(function (c) {
                    _this.challenges(c);
                });
                FirebaseUtilities.getDrivers().then(function (d) {
                    _this.drivers(d);
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
    RacesAdmin.prototype.submitValidateRace = function (race) {
        race.validating(false);
    };
    RacesAdmin.prototype.cancelValidateRace = function (race) {
    };
    RacesAdmin.prototype.validateRace = function (race) {
        race.validating(true);
    };
    RacesAdmin.prototype.change = function (race) {
        debugger;
    };
    return RacesAdmin;
})(PageBase);
//# sourceMappingURL=Races.js.map