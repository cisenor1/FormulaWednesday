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
        this.updateDriverStandingsText = ko.observable("Update Driver's Championship");
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
    updateDriverStandings() {
        var stored = this.updateDriverStandingsText();
        this.updateDriverStandingsText("Updating...");
        FormulaWednesdaysUtilities.getDriverStandings().then((standings) => {
            //FirebaseUtilities.updateDriverStandings(standings).then(() => {
            //    this.updateDriverStandingsText(stored);
            //    this.app.alert("Driver standings updated.");
            //});
        }).catch((err) => {
            this.app.alert(err);
        });
    }
}
