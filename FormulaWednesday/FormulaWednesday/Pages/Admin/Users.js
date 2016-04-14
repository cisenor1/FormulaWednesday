var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var UsersAdmin = (function (_super) {
    __extends(UsersAdmin, _super);
    function UsersAdmin(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Users.html";
        this.divId = "users-admin";
        this.users = ko.observableArray([]);
        this.showAddUserPane = ko.observable(false);
        this.editing = ko.observable(false);
        this.newName = ko.observable("");
        this.newId = ko.observable("");
        this.roles = ["admin", "user"];
        this.vmPromise = this.createVM();
    }
    UsersAdmin.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            FirebaseUtilities.getAllUsers().then(function (values) {
                _this.users(values);
                resolve(_this);
            });
        });
    };
    UsersAdmin.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    UsersAdmin.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    UsersAdmin.prototype.editUser = function (user) {
        this.cachedUser = {
            id: ko.observable(user.id()),
            points: ko.observable(user.points()),
            role: ko.observable(user.role()),
            name: ko.observable(user.name()),
            editing: ko.observable(false)
        };
        this.editing(true);
        user.editing(true);
    };
    UsersAdmin.prototype.saveData = function (item) {
        FirebaseUtilities.saveUser(item).then(function (success) {
        }).catch(function (e) { alert(e); });
        item.editing(false);
        this.editing(false);
    };
    UsersAdmin.prototype.cancel = function (item) {
        var c = this.cachedUser;
        item.id(c.id());
        item.name(c.name());
        item.points(c.points());
        item.role(c.role());
        item.editing(false);
        this.editing(false);
    };
    UsersAdmin.prototype.addUser = function () {
        this.showAddUserPane(true);
        debugger;
    };
    return UsersAdmin;
})(PageBase);
//# sourceMappingURL=Users.js.map