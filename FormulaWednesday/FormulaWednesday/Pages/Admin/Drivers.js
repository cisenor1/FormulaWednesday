class DriversAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Admin/Drivers.html";
        this.divId = "drivers-admin";
        this.drivers = ko.observableArray([]);
        this.showAddUserPane = ko.observable(false);
        this.editing = ko.observable(false);
        this.newName = ko.observable("");
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
            FirebaseUtilities.getDrivers(true).then((values) => {
                this.drivers(values);
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
    setActive(active, driver) {
    }
    saveDriver(driver) {
        debugger;
    }
    editUser(user) {
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
    saveData(item) {
        FirebaseUtilities.saveUser(item).then((success) => {
        }).catch((e) => { alert(e); });
        item.editing(false);
        this.editing(false);
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
        var fullName = this.newName();
        var displayName = this.newId();
        if (!FormulaWednesdaysUtilities.validatedisplayName(displayName)) {
            alert("Bad displayName");
            return false;
        }
        var pass = this.newPass();
        var passConfirm = this.newPassConfirm();
        var email = this.newEmail();
        var role = this.role();
        if (pass.localeCompare(passConfirm)) {
            alert("nope");
            return;
        }
        var key = FormulaWednesdaysUtilities.getKeyFromEmail(email);
        var user = {
            key: ko.observable(key),
            displayName: ko.observable(displayName),
            fullname: ko.observable(fullName),
            points: ko.observable(0),
            role: ko.observable(role),
            email: ko.observable(email),
            editing: ko.observable(false)
        };
        var hashedPass = FormulaWednesdaysUtilities.hashPassword(pass);
        FirebaseUtilities.createUser(user, hashedPass).then((v) => {
            // go on to add user to database
            var uid = v.uid;
            FirebaseUtilities.addNewUser(user).then((s) => {
                debugger;
            });
        }).catch((e) => {
            // handle the error
            alert(e);
        });
    }
}
