var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PreferencesPage = (function (_super) {
    __extends(PreferencesPage, _super);
    // constructor will do heavy lifting
    function PreferencesPage(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Preferences/Preferences.html";
        this.fullname = ko.observable("");
        this.username = ko.observable("");
        this.newPass = ko.observable("");
        this.confirmPass = ko.observable("");
        this.passwordAlert = ko.observable();
        this.usernameAlert = ko.observable();
        this.oldPass = ko.observable("");
        this.passwordSuccess = ko.observable("");
        this.usernameSuccess = ko.observable("");
        this.username = this.app.user.username;
        this.fullname = this.app.user.fullname;
        this.vmPromise = this.createVM();
    }
    PreferencesPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            resolve(_this);
        });
    };
    PreferencesPage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    PreferencesPage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    PreferencesPage.prototype.changePassword = function () {
        var _this = this;
        var newpass = this.newPass();
        var confirm = this.confirmPass();
        if (newpass !== confirm) {
            this.passwordAlert("Password and confirmation must match.");
            return false;
        }
        this.passwordAlert("");
        var oldPassword = FormulaWednesdaysUtilities.hashPassword(this.oldPass());
        var hashed = FormulaWednesdaysUtilities.hashPassword(newpass);
        FirebaseUtilities.changePassword(this.app.user, oldPassword, hashed).then(function (b) {
            _this.passwordSuccess("Your password has been changed successfully.");
            _this.newPass("");
            _this.oldPass("");
            _this.confirmPass("");
            _this.app.credentials.password = hashed;
            _this.app.refreshUserInfo(_this.app.user);
        }).catch(function (e) {
            _this.newPass("");
            _this.oldPass("");
            _this.confirmPass("");
            _this.passwordAlert(e.message);
        });
    };
    PreferencesPage.prototype.changeUsername = function () {
        var _this = this;
        var username = this.username();
        FirebaseUtilities.changeUsername(this.app.user, username).then(function (b) {
            _this.usernameSuccess("Your username has been changed successfully.");
            _this.app.user.username(username);
            _this.app.refreshUserInfo(_this.app.user);
            return;
        }).catch(function (e) {
            _this.usernameAlert(e.message);
            return;
        });
    };
    return PreferencesPage;
})(PageBase);
//# sourceMappingURL=Preferences.js.map