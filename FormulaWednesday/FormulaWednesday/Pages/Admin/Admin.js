var AdminPage = (function () {
    function AdminPage() {
        this.markupUri = "Pages/Admin/Admin.html";
    }
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
})();
