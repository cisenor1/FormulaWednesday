class BlogAdmin extends PageBase {
    constructor(app) {
        super(app);
        this.markupUri = "Pages/Admin/Blog.html";
        this.newTitle = ko.observable("");
        this.newContent = ko.observable("");
        this.vmPromise = this.createVM();
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            resolve(this);
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
    submitCreateBlogPost() {
        FirebaseUtilities.addNewBlogPost({
            title: this.newTitle(),
            message: this.newContent(),
            timestamp: Date.now().toString(),
            user: this.app.user
        });
    }
    formatDate(timestamp) {
        alert(timestamp);
    }
}
