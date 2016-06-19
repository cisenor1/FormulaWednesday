class DriversAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Drivers.html";
    divId: string = "drivers-admin";
    drivers = ko.observableArray([]);
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
    updateDriverStandingsText = ko.observable("Update Driver's Championship");

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getDrivers(true).then((values) => {
                this.drivers(values);
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

    setActive(active: boolean, driver: Driver) {

    }

    saveDriver(driver: Driver) {
        debugger;
    }

    updateDriverStandings() {
        var stored = this.updateDriverStandingsText();
        this.updateDriverStandingsText("Updating...");
        FormulaWednesdaysUtilities.getDriverStandings().then((standings) => {
            FirebaseUtilities.updateDriverStandings(standings).then(() => {
                this.updateDriverStandingsText(stored);
                this.app.alert("Driver standings updated.");
            });

        }).catch((err) => {
            this.app.alert(err);
        });
    }
}