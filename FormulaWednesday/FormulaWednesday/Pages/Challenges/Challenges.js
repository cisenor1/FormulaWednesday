var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ChallengesPage = (function (_super) {
    __extends(ChallengesPage, _super);
    // constructor will do heavy lifting
    function ChallengesPage(app) {
        _super.call(this, app);
        this.vm = {
            drivers: ko.observableArray(),
            teams: ko.observableArray(),
            challenges: ko.observableArray(),
            sortDriversByName: this.sortDriversByName,
            sortDriversByTeam: this.sortDriversByTeam
        };
        this.markupUri = "Pages/Challenges/Challenges.html";
        this.createVM();
    }
    ChallengesPage.prototype.createVM = function () {
        if (!this.app.user) {
            return false;
        }
        _super.prototype.createVM.call(this);
    };
    ChallengesPage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    ChallengesPage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    return ChallengesPage;
})(PageBase);
