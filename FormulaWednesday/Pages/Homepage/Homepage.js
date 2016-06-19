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
                var esc = FirebaseUtilities.escape("<u>Fernando Alonso</u>: \"Can I stop now?\"<br><u>Pit Wall</u>: \"No Fernando, keep going, we want to see if we can get a point if something happens to other cars.\"<br/><u>Fernando Alonso</u>: \"Awww... ARGH!..\"");
                this.quote(FirebaseUtilities.unescape(esc));
                this.imageSource("http://cdn-1.motorsport.com/static/img/mgl/6000000/6030000/6035000/6035900/6035921/s8/f1-brazilian-gp-2015-fernando-alonso-mclaren-watches-qualifying-from-a-chair-at-the-side-o.jpg");
                resolve(this);
            }).catch((e) => {
                this.app.alert(e);
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
