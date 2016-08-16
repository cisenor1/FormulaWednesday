class StandingsPage extends PageBase {
    // constructor will do heavy lifting
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Standings/Standings.html";
        this.divId = "standings";
        this.sortedDrivers = ko.observableArray([]);
        this.sortedUsers = ko.observableArray([]);
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            this.sortedDrivers(this.app.sortedDrivers());
            this.sortedUsers(this.app.sortedUsers());
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
}
