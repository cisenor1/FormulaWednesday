var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ChallengesAdmin = (function (_super) {
    __extends(ChallengesAdmin, _super);
    function ChallengesAdmin(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Admin/Challenges.html";
        this.divId = "challenges-admin";
        this.challenges = ko.observableArray([]);
        this.showAddChallengePane = ko.observable(false);
        this.editing = ko.observable(false);
        this.newChallengeName = ko.observable("");
        this.newChallengeKey = ko.observable("");
        this.newPointValue = ko.observable(2);
        this.roles = ["admin", "user"];
        this.role = ko.observable("");
        this.vmPromise = this.createVM();
    }
    ChallengesAdmin.prototype.createVM = function () {
        var _this = this;
        if (!this.app.user) {
            return false;
        }
        return new Promise(function (resolve, reject) {
            FirebaseUtilities.getChallenges().then(function (values) {
                _this.challenges(values);
                resolve(_this);
            });
        });
    };
    ChallengesAdmin.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    ChallengesAdmin.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    ChallengesAdmin.prototype.saveData = function (item) {
        FirebaseUtilities.saveUser(item).then(function (success) {
        }).catch(function (e) { alert(e); });
        item.editing(false);
        this.editing(false);
    };
    ChallengesAdmin.prototype.cancel = function (item) {
        ////var c = this.cachedUser;
        //item.key(c.key());
        //item.fullname(c.fullname());
        //item.username(c.username());
        //item.points(c.points());
        //item.role(c.role());
        //item.editing(false);
        //this.editing(false);
    };
    ChallengesAdmin.prototype.addChallenge = function () {
        this.showAddChallengePane(true);
    };
    ChallengesAdmin.prototype.editChallenge = function (item) {
        debugger;
    };
    ChallengesAdmin.prototype.submitCreateChallenge = function () {
        debugger;
        //var fullName = this.newName();
        //var username = this.newId();
        //if (!FormulaWednesdaysUtilities.validateUsername(username)) {
        //    alert("Bad Username");
        //    return false;
        //}
        //var pass = this.newPass();
        //var passConfirm = this.newPassConfirm();
        //var email = this.newEmail();
        //var role = this.role();
        //if (pass.localeCompare(passConfirm)) {
        //    alert("nope");
        //    return;
        //}
        //var key = FormulaWednesdaysUtilities.getKeyFromEmail(email);
        //var user: User = {
        //    key: ko.observable(key),
        //    username: ko.observable(username),
        //    fullname: ko.observable(fullName),
        //    points: ko.observable(0),
        //    role: ko.observable(role),
        //    email: ko.observable(email),
        //    editing: ko.observable(false)
        //}
        //var hashedPass = FormulaWednesdaysUtilities.hashPassword(pass);
        //FirebaseUtilities.createUser(user, hashedPass).then((v:any) => {
        //    // go on to add user to database
        //    var uid = v.uid;
        //    FirebaseUtilities.addNewUser(user).then((s) => {
        //        debugger;
        //    });
        //}).catch((e) => {
        //// handle the error
        //    alert(e);
        //});
    };
    return ChallengesAdmin;
})(PageBase);
//# sourceMappingURL=Challenges.js.map