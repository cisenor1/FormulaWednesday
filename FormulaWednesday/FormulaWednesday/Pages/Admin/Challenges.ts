class ChallengesAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Challenges.html";
    challenges = ko.observableArray([]);
    showAddChallengePane = ko.observable(false);
    editing = ko.observable(false);
    cachedChallenge: Challenge;
    newChallengeName = ko.observable("");
    newChallengeKey = ko.observable("");
    newPointValue = ko.observable(2);
    roles = ["admin", "user"];
    role = ko.observable("");

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getChallenges().then((values) => {
                this.challenges(values);
                resolve(this);
            });
        });
    }


    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }

    getViewModel(): Promise<any> {
        return this.vmPromise;
    }
    
    saveData(item: User) {
        FirebaseUtilities.saveUser(item).then((success) => {
        }).catch((e: Error) => { alert(e); });
        item.editing(false);
        this.editing(false);
    }

    cancel(item: User) {
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