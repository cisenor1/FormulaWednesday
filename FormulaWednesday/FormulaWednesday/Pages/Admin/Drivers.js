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
    DriversAdmin.prototype.editUser = function (user) {
        this.cachedUser = {
            key: ko.observable(user.key()),
            points: ko.observable(user.points()),
            role: ko.observable(user.role()),
            fullname: ko.observable(user.fullname()),
            username: ko.observable(user.username()),
            email: ko.observable(user.email()),
            editing: ko.observable(false)
        };
        this.editing(true);
        user.editing(true);
    };
    DriversAdmin.prototype.saveData = function (item) {
        FirebaseUtilities.saveUser(item).then(function (success) {
        }).catch(function (e) { alert(e); });
        item.editing(false);
        this.editing(false);
    };
    DriversAdmin.prototype.cancel = function (item) {
        var c = this.cachedUser;
        item.key(c.key());
        item.fullname(c.fullname());
        item.username(c.username());
        item.points(c.points());
        item.role(c.role());
        item.editing(false);
        this.editing(false);
    };
    DriversAdmin.prototype.addUser = function () {
        this.showAddUserPane(true);
    };
    DriversAdmin.prototype.submitCreateUser = function () {
        var fullName = this.newName();
        var username = this.newId();
        if (!FormulaWednesdaysUtilities.validateUsername(username)) {
            alert("Bad Username");
            return false;
        }
        var pass = this.newPass();
        var passConfirm = this.newPassConfirm();
        var email = this.newEmail();
        var role = this.role();
        if (pass.localeCompare(passConfirm)) {
            alert("nope");
            return;
        }
        var key = FormulaWednesdaysUtilities.getKeyFromEmail(email);
        var user = {
            key: ko.observable(key),
            username: ko.observable(username),
            fullname: ko.observable(fullName),
            points: ko.observable(0),
            role: ko.observable(role),
            email: ko.observable(email),
            editing: ko.observable(false)
        };
        var hashedPass = FormulaWednesdaysUtilities.hashPassword(pass);
        FirebaseUtilities.createUser(user, hashedPass).then(function (v) {
            // go on to add user to database
            var uid = v.uid;
            FirebaseUtilities.addNewUser(user).then(function (s) {
                debugger;
            });
        }).catch(function (e) {
            // handle the error
            alert(e);
        });
    };
    return DriversAdmin;
})(PageBase);
