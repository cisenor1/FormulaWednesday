class PreferencesPage extends PageBase implements Page {

    markupUri: string = "Pages/Preferences/Preferences.html";

    fullname = ko.observable("");
    displayName = ko.observable("");
    newPass = ko.observable("");
    confirmPass = ko.observable("");
    passwordAlert = ko.observable();
    displayNameAlert = ko.observable();
    oldPass = ko.observable("");
    passwordSuccess = ko.observable("");
    displayNameSuccess = ko.observable("");
    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.displayName = this.app.user.displayName;
        this.fullname = this.app.user.fullname;
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            resolve(this);
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
        let restUser: RestUser = {
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

    cleardisplayNameAlert(d, e: KeyboardEvent) {
        if (e.keyCode !== 13) {
            this.displayNameSuccess("");
        }
    }
}