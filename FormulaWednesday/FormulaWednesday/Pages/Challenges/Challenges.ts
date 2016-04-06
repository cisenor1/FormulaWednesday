declare var fetch;
class ChallengesPage extends PageBase implements Page  {
    vm: ChallengesVM = {
        drivers: ko.observableArray<Driver>(),
        teams: ko.observableArray<Team>(),
        challenges: ko.observableArray<Challenge>(),
        sortDriversByName: this.sortDriversByName,
        sortDriversByTeam: this.sortDriversByTeam
    };
    markupUri: string = "Pages/Challenges/Challenges.html";
    divId = "challenges";

    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any>{
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
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }

    getViewModel(): Promise<any>{
        return this.vmPromise;
    }
}

interface ChallengesVM extends ViewModelBase{
}