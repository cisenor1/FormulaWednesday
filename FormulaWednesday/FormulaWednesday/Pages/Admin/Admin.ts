class AdminPage extends PageBase implements Page {
    markupUri: string = "Pages/Admin/Admin.html";
    vm: any = {};
    subPage: Page;
    divId = "admin";

    constructor(app: FormulaWednesdayApp, key?: string) {
        super(app);
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

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            var promises = [];
            Promise.all(promises).then((values) => {
                resolve(this.vm);
            });
        });
    }

    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("");
        });
    }

    getViewModel(): Promise<AdminVM> {
        return new Promise<AdminVM>((resolve, reject) => {
            resolve({});
        });
    }
}

interface AdminVM {
    users?: KnockoutObservableArray<User>;
}