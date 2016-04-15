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
        this.vmPromise = this.createVM();
    }
    PreferencesPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            resolve(_this.vm);
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
    return PreferencesPage;
})(PageBase);
