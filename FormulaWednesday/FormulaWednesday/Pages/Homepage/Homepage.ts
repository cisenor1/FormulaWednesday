class HomePage extends PageBase implements Page {


    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
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
    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("");
        });
    }

    getViewModel(): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            resolve({});
        });
    }
}