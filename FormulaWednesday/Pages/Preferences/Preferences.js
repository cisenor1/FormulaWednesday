class PreferencesPage extends PageBase {
    // constructor will do heavy lifting
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Preferences/Preferences.html";
        this.fullname = ko.observable("");
        this.username = ko.observable("");
        this.newPass = ko.observable("");
        this.confirmPass = ko.observable("");
        this.passwordAlert = ko.observable();
        this.usernameAlert = ko.observable();
        this.oldPass = ko.observable("");
        this.passwordSuccess = ko.observable("");
        this.usernameSuccess = ko.observable("");
        this.username = this.app.user.username;
        this.fullname = this.app.user.fullname;
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            resolve(this);
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
    changePassword() {
        var newpass = this.newPass();
        var confirm = this.confirmPass();
        if (newpass !== confirm) {
            this.passwordAlert("Password and confirmation must match.");
            return false;
        }
        this.passwordAlert("");
        var oldPassword = FormulaWednesdaysUtilities.hashPassword(this.oldPass());
        var hashed = FormulaWednesdaysUtilities.hashPassword(newpass);
        FirebaseUtilities.changePassword(this.app.user, oldPassword, hashed).then((b) => {
            this.passwordSuccess("Your password has been changed successfully.");
            this.newPass("");
            this.oldPass("");
            this.confirmPass("");
            this.app.credentials.password = hashed;
            this.app.refreshUserInfo(this.app.user);
        }).catch((e) => {
            this.newPass("");
            this.oldPass("");
            this.confirmPass("");
            this.passwordAlert(e.message);
        });
    }
    changeUsername() {
        var username = this.username();
        return FirebaseUtilities.changeUsername(this.app.user, username).then((b) => {
            this.usernameSuccess("Your username has been changed successfully.");
            this.app.user.username(username);
            this.app.refreshUserInfo(this.app.user);
            this.username("");
        }).catch((e) => {
            this.usernameAlert(e.message);
            return;
        });
    }
    clearUsernameAlert(d, e) {
        if (e.keyCode !== 13) {
            this.usernameSuccess("");
        }
    }
}
