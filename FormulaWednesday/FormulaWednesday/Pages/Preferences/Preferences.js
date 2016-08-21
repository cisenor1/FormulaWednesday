class PreferencesPage extends PageBase {
    // constructor will do heavy lifting
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Preferences/Preferences.html";
        this.fullname = ko.observable("");
        this.displayName = ko.observable("");
        this.newPass = ko.observable("");
        this.confirmPass = ko.observable("");
        this.passwordAlert = ko.observable();
        this.displayNameAlert = ko.observable();
        this.oldPass = ko.observable("");
        this.passwordSuccess = ko.observable("");
        this.displayNameSuccess = ko.observable("");
        this.displayName = this.app.user.displayName;
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
        RestUtilities.updateUserPassword(this.app.user, newpass).then(success => {
            this.passwordSuccess("Your password has been changed successfully.");
            this.newPass("");
            this.oldPass("");
            this.confirmPass("");
            this.app.credentials.password = newpass;
            this.app.refreshUserInfo(this.app.user);
        }).catch(error => {
            this.newPass("");
            this.oldPass("");
            this.confirmPass("");
            this.passwordAlert(error.message);
        });
    }
    changedisplayName() {
        var displayName = this.displayName();
        let restUser = {
            displayName: displayName,
            key: this.app.user.key()
        };
        return RestUtilities.updateUserInfo(restUser).then((b) => {
            this.displayNameSuccess("Your displayName has been changed successfully.");
            this.app.user.displayName(displayName);
            this.app.refreshUserInfo(this.app.user);
            this.displayName("");
        }).catch((e) => {
            this.displayNameAlert(e.message);
            return;
        });
    }
    cleardisplayNameAlert(d, e) {
        if (e.keyCode !== 13) {
            this.displayNameSuccess("");
        }
    }
}
