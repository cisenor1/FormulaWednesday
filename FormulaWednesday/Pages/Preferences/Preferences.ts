declare var fetch;
class PreferencesPage extends PageBase implements Page {

    markupUri: string = "Pages/Preferences/Preferences.html";

    fullname = ko.observable("");
    username = ko.observable("");
    newPass = ko.observable("");
    confirmPass = ko.observable("");
    passwordAlert = ko.observable();
    usernameAlert = ko.observable();
    oldPass = ko.observable("");
    passwordSuccess = ko.observable("");
    usernameSuccess = ko.observable("");
    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.username = this.app.user.username;
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

    clearUsernameAlert(d, e: KeyboardEvent) {
        if (e.keyCode !== 13) {
            this.usernameSuccess("");
        }
    }
}