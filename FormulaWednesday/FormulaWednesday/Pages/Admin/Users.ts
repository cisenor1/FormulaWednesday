class UsersAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Users.html";
    divId: string = "users-admin";
    users = ko.observableArray([]);
    showAddUserPane = ko.observable(false);
    editing = ko.observable(false);
    cachedUser: User;
    newName = ko.observable("");
    newEmail = ko.observable("");
    newId = ko.observable("");
    roles = ["admin", "user"];
    role = ko.observable("");
    newPass = ko.observable("");
    newPassConfirm = ko.observable("");

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getAllUsers().then((values) => {
                this.users(values);
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

    editUser(user: User) {
        this.cachedUser = {
            key: ko.observable(user.key()),
            points: ko.observable(user.points()),
            role: ko.observable(user.role()),
            fullname: ko.observable(user.fullname()),
            displayName: ko.observable(user.displayName()),
            email: ko.observable(user.email()),
            editing: ko.observable(false)
        };
        this.editing(true);
        user.editing(true);
    }

    saveData(item: User) {
        FirebaseUtilities.saveUser(item).then((success) => {
            this.app.alert(item.displayName() + " has been saved successfully.");
        }).catch((e: Error) => { this.app.alert(e.message); });
        item.editing(false);
        this.editing(false);
    }

    cancel(item: User) {
        var c = this.cachedUser;
        item.key(c.key());
        item.fullname(c.fullname());
        item.displayName(c.displayName());
        item.points(c.points());
        item.role(c.role());
        item.editing(false);
        this.editing(false);
    }

    addUser() {
        this.showAddUserPane(true);
    }

    submitCreateUser() {
        var fullName = this.newName();
        var username = this.newId();
        if (!FormulaWednesdaysUtilities.validateUsername(username)) {
            this.app.alert("Bad Username");
            return false;
        }
        var pass = this.newPass();
        var passConfirm = this.newPassConfirm();
        var email = this.newEmail();
        var role = this.role();
        if (pass.localeCompare(passConfirm)) {
            this.app.alert("Passwords must match.");
            return;
        }
        var key = FormulaWednesdaysUtilities.getKeyFromEmail(email);
        var user: User = {
            key: ko.observable(key),
            displayName: ko.observable(username),
            fullname: ko.observable(fullName),
            points: ko.observable(0),
            role: ko.observable(role),
            email: ko.observable(email),
            editing: ko.observable(false)
        }
        var hashedPass = FormulaWednesdaysUtilities.hashPassword(pass);
        FirebaseUtilities.createUser(user, hashedPass).then((v: any) => {
            // go on to add user to database
            var uid = v.uid;
            FirebaseUtilities.addNewUser(user).then((s) => {
                this.app.alert(user.displayName() + " has been created successfully");
            });

        }).catch((e) => {
            // handle the error
            this.app.alert(e);
        });
    }
}