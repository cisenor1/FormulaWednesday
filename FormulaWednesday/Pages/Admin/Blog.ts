declare var tinymce;
class BlogAdmin extends PageBase implements Page {
    markupUri: string = "Pages/Admin/Blog.html";
    newTitle: KnockoutObservable<string> = ko.observable<string>("");
    newContent: KnockoutObservable<string> = ko.observable<string>("");
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
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

    submitCreateBlogPost() {
        FirebaseUtilities.addNewBlogPost({
            title: this.newTitle(),
            message: this.newContent(),
            timestamp: Date.now().toString(),
            user: this.app.user
        });
    }

    formatDate(timestamp: number) {
        alert(timestamp);
    }

}