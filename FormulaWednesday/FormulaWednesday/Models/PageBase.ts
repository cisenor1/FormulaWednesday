class PageBase {

    markupUri: string;
    vmPromise: Promise<any>;
    vm: any;
    app: FormulaWednesdayApp;

    constructor(app:FormulaWednesdayApp) {
        this.app = app;
    }

    createVM() {
        
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