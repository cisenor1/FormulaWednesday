declare var fetch;
class PreferencesPage extends PageBase implements Page {

    markupUri: string = "Pages/Preferences/Preferences.html";
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
            resolve(this.vm);
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