var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DriversAdmin = (function (_super) {
    __extends(DriversAdmin, _super);
    function DriversAdmin(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Drivers.html";
        this.divId = "drivers-admin";
        this.drivers = ko.observableArray([]);
        this.showAddUserPane = ko.observable(false);
        this.editing = ko.observable(false);
        this.newName = ko.observable("");
        this.newEmail = ko.observable("");
        this.newId = ko.observable("");
        this.roles = ["admin", "user"];
        this.role = ko.observable("");
        this.newPass = ko.observable("");
        this.newPassConfirm = ko.observable("");
        this.updateDriverStandingsText = ko.observable("Update Driver's Championship");
        this.vmPromise = this.createVM();
    }
    DriversAdmin.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            FirebaseUtilities.getDrivers(true).then(function (values) {
                _this.drivers(values);
                resolve(_this);
            });
        });
    };
    DriversAdmin.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    DriversAdmin.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    DriversAdmin.prototype.setActive = function (active, driver) {
    };
    DriversAdmin.prototype.saveDriver = function (driver) {
        debugger;
    };
    DriversAdmin.prototype.updateDriverStandings = function () {
        var _this = this;
        var stored = this.updateDriverStandingsText();
        this.updateDriverStandingsText("Updating...");
        FormulaWednesdaysUtilities.getDriverStandings().then(function (standings) {
            FirebaseUtilities.updateDriverStandings(standings).then(function () {
                _this.updateDriverStandingsText(stored);
                _this.app.alert("Driver standings updated.");
            });
        }).catch(function (err) {
            _this.app.alert(err);
        });
    };
    return DriversAdmin;
}(PageBase));
