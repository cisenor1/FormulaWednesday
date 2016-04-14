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
    
    

}

interface ViewModelBase {
    challenges?: KnockoutObservableArray<Challenge>;
    teams?: KnockoutObservableArray<Team>;
    drivers?: KnockoutObservableArray<Driver>;
    sortDriversByName?: () => void;
    sortDriversByTeam?: () => void;
    title: KnockoutObservable<string>;
}