var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BlogAdmin = (function (_super) {
    __extends(BlogAdmin, _super);
    function BlogAdmin(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Blog.html";
        this.newTitle = ko.observable("");
        this.newContent = ko.observable("");
        this.vmPromise = this.createVM();
    }
    BlogAdmin.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            resolve(_this);
        });
    };
    BlogAdmin.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    BlogAdmin.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    BlogAdmin.prototype.submitCreateBlogPost = function () {
        FirebaseUtilities.addNewBlogPost({
            title: this.newTitle(),
            message: this.newContent(),
            timestamp: Date.now().toString(),
            user: this.app.user
        });
    };
    BlogAdmin.prototype.formatDate = function (timestamp) {
        alert(timestamp);
    };
    return BlogAdmin;
})(PageBase);
