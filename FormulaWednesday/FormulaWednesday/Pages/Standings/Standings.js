var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var StandingsPage = (function (_super) {
    __extends(StandingsPage, _super);
    // constructor will do heavy lifting
    function StandingsPage(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Standings/Standings.html";
        this.divId = "standings";
        this.sortedDrivers = ko.observableArray([]);
        this.sortedUsers = ko.observableArray([]);
        this.vmPromise = this.createVM();
    }
    StandingsPage.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            _this.sortedDrivers(_this.app.sortedDrivers());
            _this.sortedUsers(_this.app.sortedUsers());
            resolve(_this);
        });
    };
    StandingsPage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    StandingsPage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    return StandingsPage;
})(PageBase);
