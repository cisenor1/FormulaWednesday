class AdminPage extends PageBase {
    constructor(app, key) {
        super(app);
        this.markupUri = "Pages/Admin/Admin.html";
        this.vm = {};
        this.divId = "admin";
        switch (key) {
            case "admin-users":
                this.subPage = new UsersAdmin(this.app);
                break;
            default:
                this.subPage = new UsersAdmin(this.app);
        }
        this.subPage.getViewModel().then((vm) => {
            this.vm = vm;
        });
    }
    createVM() {
        if (!this.app.user) {
            return false;
        }
        return new Promise((resolve, reject) => {
            var promises = [];
            Promise.all(promises).then((values) => {
                resolve(this.vm);
            });
        });
    }
    getMarkup() {
        return new Promise((resolve, reject) => {
            resolve("");
        });
    }
    getViewModel() {
        return new Promise((resolve, reject) => {
            resolve({});
        });
    }
}
