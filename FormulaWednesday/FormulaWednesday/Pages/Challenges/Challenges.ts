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

    // constructor will do heavy lifting
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.createVM();
    }

    createVM() {
        if (!this.app.user) {
            return false;
        }
        super.createVM();
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

interface ChallengesVM extends ViewModelBase{
}