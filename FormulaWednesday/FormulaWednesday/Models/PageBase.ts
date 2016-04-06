class PageBase {

    markupUri: string;
    vmPromise: Promise<any>;
    vm: any;
    app: FormulaWednesdayApp;

    constructor(app:FormulaWednesdayApp) {
        this.app = app;
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        this.vmPromise = new Promise<any>((resolve, reject) => {
            var promises = [];
            promises.push(FirebaseUtilities.getChallenges());
            promises.push(FirebaseUtilities.getTeams());
            promises.push(FirebaseUtilities.getDrivers());
            Promise.all(promises).then((values) => {
                this.vm.challenges(<any>values[0]);
                this.vm.teams(<any>values[1]);
                this.vm.drivers(<any>values[2]);
                resolve(this.vm);
            });
        });
    }



    sortDriversByName() {
        this.vm.drivers.sort((aDriver: Driver, bDriver: Driver) => {
            var aName = aDriver.name;
            var bName = bDriver.name;
            return aName.localeCompare(bName);
        });
    }

    sortDriversByTeam() {
        this.vm.drivers.sort((aDriver: Driver, bDriver: Driver) => {
            var aTeam = aDriver.team;
            var bTeam = bDriver.team;
            return aTeam.localeCompare(bTeam);
        });
    }

}

interface ViewModelBase {
    challenges?: KnockoutObservableArray<Challenge>;
    teams?: KnockoutObservableArray<Team>;
    drivers?: KnockoutObservableArray<Driver>;
    sortDriversByName?: () => void;
    sortDriversByTeam?: () => void;

}