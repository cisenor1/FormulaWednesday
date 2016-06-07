class HomePage extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Homepage/Homepage.html";
        this.blogPosts = ko.observableArray([]);
        this.imageSource = ko.observable("");
        this.quote = ko.observable("");
        this.vmPromise = this.createVM();
    }
    createVM() {
        return new Promise((resolve, reject) => {
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
    getMarkup() {
        return new Promise((resolve, reject) => {
            fetch(this.markupUri).then((value) => {
                value.text().then((output) => {
                    resolve(output);
                });
            });
        });
    }
    getViewModel() {
        return this.vmPromise;
    }
    getBlogPosts(count) {
        return FirebaseUtilities.getBlogPosts(count);
    }
}
