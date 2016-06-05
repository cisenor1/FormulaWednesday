class HomePage extends PageBase implements Page {

    markupUri: string = "Pages/Homepage/Homepage.html";
    blogPosts: KnockoutObservableArray<BlogObject> = ko.observableArray<BlogObject>([]);
    imageSource: KnockoutObservable<string> = ko.observable<string>("");
    quote: KnockoutObservable<string> = ko.observable<string>("");
    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }
    createVM(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getBlogPosts(5).then((bs) => {
                this.blogPosts(bs);
                var esc = FirebaseUtilities.escape("<u>Daniel Ricciardo (after finishing the race in 2nd)</u>: \"Just save it. Nothing you can say can make it any better.\"");
                this.quote(FirebaseUtilities.unescape(esc));
                this.imageSource("http://cdn.scahw.com.au/cdn-1d1b9f5cca9ef30/imagevaultfiles/id_405499/cf_7/ricciardo-monaco-628.jpg");
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

    getBlogPosts(count?:number): Promise<BlogObject[]> {
        return FirebaseUtilities.getBlogPosts(count);
    }
}