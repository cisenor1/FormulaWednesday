var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HomePage = (function (_super) {
    __extends(HomePage, _super);
    function HomePage(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Homepage/Homepage.html";
        this.vmPromise = this.createVM();
    }
    HomePage.prototype.createVM = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this);
        });
    };
    HomePage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    HomePage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    return HomePage;
})(PageBase);
//# sourceMappingURL=Homepage.js.map