class ChallengesAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Admin/Challenges.html";
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
    createVM() {
        if (!this.app.user) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            FirebaseUtilities.getChallengesForRace(this.app.selectedRace).then((values) => {
                this.challenges(values);
                resolve(this);
            });
        });
    }
    getMarkup() {
        return new Promise((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }
    getViewModel() {
        return this.vmPromise;
    }
    saveData(item) {
        FirebaseUtilities.saveUser(item).then((success) => {
        }).catch((e) => { alert(e); });
        item.editing(false);
        this.editing(false);
    }
    cancel(item) {
        ////var c = this.cachedUser;
        //item.key(c.key());
        //item.fullname(c.fullname());
        //item.username(c.username());
        //item.points(c.points());
        //item.role(c.role());
        //item.editing(false);
        //this.editing(false);
    }
    addChallenge() {
        this.showAddChallengePane(true);
    }
    editChallenge(item) {
    }
    submitCreateChallenge() {
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
    }
}
