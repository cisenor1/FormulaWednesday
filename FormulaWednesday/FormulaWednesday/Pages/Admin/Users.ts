class UsersAdmin extends PageBase implements Page {

    markupUri: string = "Pages/Admin/Users.html";
    divId: string = "users-admin";
    users = ko.observableArray([]);
    showAddUserPane = ko.observable(false);
    editing = ko.observable(false);
    cachedUser: User;
    newName = ko.observable("");
    newId = ko.observable("");
    roles = ["admin", "user"];

    constructor(app: FormulaWednesdayApp) {
        super(app);
        this.vmPromise = this.createVM();
    }

    createVM(): Promise<any> {
        if (!this.app.user) {
            return <any>false;
        }
        return new Promise<any>((resolve, reject) => {
            FirebaseUtilities.getAllUsers().then((values) => {
                this.users(values);
                resolve(this);
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

    editUser(user: User) {
        this.cachedUser = {
            id: ko.observable(user.id()),
            points: ko.observable(user.points()),
            role: ko.observable(user.role()),
            name: ko.observable(user.name()),
            editing: ko.observable(false)
        };
        this.editing(true);
        user.editing(true);
    }

    saveData(item: User) {
        FirebaseUtilities.saveUser(item).then((success) => {
        }).catch((e: Error) => { alert(e); });
        item.editing(false);
        this.editing(false);
    }

    cancel(item: User) {
        var c = this.cachedUser;
        item.id(c.id());
        item.name(c.name());
        item.points(c.points());
        item.role(c.role());
        item.editing(false);
        this.editing(false);
    }

    addUser() {
        this.showAddUserPane(true);
        debugger;
    }
}