class AdminPage implements Page {
    markupUri: string = "Pages/Admin/Admin.html";
    getMarkup(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("");
        });
    }

    getViewModel(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve({});
        });
    }
}