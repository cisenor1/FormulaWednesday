class RacesAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Races.html";
    divId: string = "races-admin";
    races: KnockoutObservableArray<Race> = ko.observableArray([]);
    challenges: KnockoutObservableArray<Challenge> = ko.observableArray([]);
    showValidateRacePane = ko.observable(false);
    editing = ko.observable(false);
    drivers = ko.observableArray([]);


    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getRaces().then((values) => {
                this.races(values);
                this.races().forEach((r) => {
                    r.done = ko.observable(r.cutoff < new Date(Date.now()));
                    r.date = <any>ko.observable(r.date.toDateString());
                    r.validating = ko.observable(false);
                });
                FirebaseUtilities.getChallenges().then((c) => {
                    this.challenges(c);
                });
                FirebaseUtilities.getDrivers().then((d) => {
                    this.drivers(d);
                });
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

    submitValidateRace(race: Race) {
        race.validating(false);
    }

    cancelValidateRace(race: Race) {
    }

    validateRace(race: Race) {
        race.validating(true);
    }

    change(race: Race) {
        debugger;
    }
}