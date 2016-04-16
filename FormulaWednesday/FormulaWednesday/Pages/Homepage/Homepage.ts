class HomePage extends PageBase implements Page {

    markupUri: string = "Pages/Homepage/Homepage.html";
    
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }
    createVM(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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