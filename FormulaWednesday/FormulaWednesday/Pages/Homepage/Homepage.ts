class HomePage extends PageBase implements Page {

    markupUri: string = "Pages/Homepage/Homepage.html";
    blogPosts: KnockoutObservableArray<BlogObject> = ko.observableArray<BlogObject>([]);

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }
    createVM(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getBlogPosts().then((bs) => {
                this.blogPosts(bs);
                resolve(this);
            }).catch((e) => {
                alert(e);
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

    getBlogPosts(): Promise<BlogObject[]> {
        return FirebaseUtilities.getAllBlogPosts();
    }
}