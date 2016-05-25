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
                var esc = FirebaseUtilities.escape("<u>Jenson Button (about Rio Haryanto)</u>: \"Get that car out the way.He's going to cost us time. I know he thinks he's quick, but he's not.\"");
                this.quote(FirebaseUtilities.unescape(esc));
                this.imageSource("http://i.huffpost.com/gen/1893329/thumbs/o-JENSON-BUTTON-570.jpg");
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