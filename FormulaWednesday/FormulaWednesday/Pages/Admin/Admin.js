var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AdminPage = (function (_super) {
    __extends(AdminPage, _super);
    function AdminPage(app, key) {
        var _this = this;
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Admin.html";
        this.vm = {};
        this.divId = "admin";
        switch (key) {
            case "admin-users":
                this.subPage = new UsersAdmin(this.app);
                break;
            default:
                this.subPage = new UsersAdmin(this.app);
        }
        this.subPage.getViewModel().then(function (vm) {
            _this.vm = vm;
        });
    }
    AdminPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            var promises = [];
            Promise.all(promises).then(function (values) {
                resolve(_this.vm);
            });
        });
    };
    AdminPage.prototype.getMarkup = function () {
        return new Promise(function (resolve, reject) {
            resolve("");
        });
    };
    AdminPage.prototype.getViewModel = function () {
        return new Promise(function (resolve, reject) {
            resolve({});
        });
    };
    return AdminPage;
})(PageBase);
//# sourceMappingURL=Admin.js.map