class StandingsPage extends PageBase implements Page {
    markupUri: string = "Pages/Standings/Standings.html";
    divId = "standings";
    sortedDrivers: KnockoutObservableArray<Driver> = ko.observableArray([]);
    sortedUsers: KnockoutObservableArray<User> = ko.observableArray([]);
    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            this.sortedDrivers(this.app.sortedDrivers())
            this.sortedUsers(this.app.sortedUsers());
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
}