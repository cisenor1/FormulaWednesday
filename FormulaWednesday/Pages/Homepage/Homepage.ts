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
                var esc = FirebaseUtilities.escape("<u>Nico Rosberg:</u> \"Gearbox problem!\"<br/><u>Pit Wall:</u>\"Driver default 101, chassis default 01.Chassis default 01. Avoid seventh gear, Nico.\"<br/><u>Nico Rosberg:</u>\"What‘s that mean? I have to shift through it.\"<br/><u>Pit Wall:</u>\"Affirm Nico you need to shift through it, affirm.\"");
                this.quote(FirebaseUtilities.unescape(esc));
                this.imageSource("http://cf.c.ooyala.com/BrdjQ3dDpXVPeQdXcDaZESodQtIjCV54/3Gduepif0T1UGY8H4xMDoxOjBzMTt2bJ");
                resolve(this);
            }).catch((e) => {
                this.app.alert(e);
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