class UsersAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Users.html";
    divId: string = "users-admin";
    users = ko.observableArray([]);
    showAddUserPane = ko.observable(false);
    editing = ko.observable(false);
    cachedUser: User;
    firstName = ko.observable("");
    lastName = ko.observable("");
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
            RestUtilities.getAllUsers().then((values) => {
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
            firstName: ko.observable(user.firstName()),
            lastName: ko.observable(user.lastName()),
            displayName: ko.observable(user.displayName()),
            email: ko.observable(user.email()),
            editing: ko.observable(false)
        };
        this.editing(true);
        user.editing(true);
    }

    saveData(item: User) {
        let userKey = item.key();
        let updatedUser: RestUser = {
            displayName: item.displayName(),
            role: item.role(),
            firstName: item.firstName(),
            lastName: item.lastName(),
            points: item.points(),
            key: userKey
        };
        RestUtilities.updateUserInfo(updatedUser).then(success => {
            return RestUtilities.getUser(userKey);
        }).then(user => {
            this.app.alert("User successfully updated.");
            item.editing(false);
            item.displayName(user.displayName());
            item.role(user.role());
            item.firstName(user.firstName());
            item.lastName(user.lastName());
            item.points(user.points());
            this.editing(false);
            this.app.buildStandingsTable();
        }).catch((error: Error) => {
            this.app.alert(error.message);
        });
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
        let firstName = this.firstName();
        let lastName = this.lastName();
        let userName = this.newId();

        if (!FormulaWednesdaysUtilities.validateUsername(userName)) {
            this.app.alert("Bad Username");
            return false;
        }
        
        var pass = this.newPass();
        var passConfirm = this.newPassConfirm();
        var email = this.newEmail();
        if (pass.localeCompare(passConfirm)) {
            this.app.alert("Passwords must match.");
            return;
        }

        let user: RestUser = {
            displayName: userName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: pass
        };

        RestUtilities.createUser(user).then(newUser => {
            this.app.alert(newUser.displayName() + " has been created successfully");
            this.users.push(newUser);
            this.clearAdd();
        }).catch((error: Error) => {
            this.app.alert(error.message);
        });
    }

    clearAdd() {
        this.firstName("");
        this.lastName("");
        this.newEmail("");
        this.newId("");
        this.newPass("");
        this.newPassConfirm("");
        this.showAddUserPane(false);
    }
}