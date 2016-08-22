class UsersAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Admin/Users.html";
        this.divId = "users-admin";
        this.users = ko.observableArray([]);
        this.showAddUserPane = ko.observable(false);
        this.editing = ko.observable(false);
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.newEmail = ko.observable("");
        this.newId = ko.observable("");
        this.roles = ["admin", "user"];
        this.role = ko.observable("");
        this.newPass = ko.observable("");
        this.newPassConfirm = ko.observable("");
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            RestUtilities.getAllUsers().then((values) => {
                this.users(values);
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
    editUser(user) {
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
    saveData(item) {
        let userKey = item.key();
        let updatedUser = {
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
        }).catch((error) => {
            this.app.alert(error.message);
        });
    }
    cancel(item) {
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
        let user = {
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
        }).catch((error) => {
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
