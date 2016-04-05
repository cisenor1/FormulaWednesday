interface Page {
    getViewModel: () => Promise<any>;
    getMarkup: () => Promise<string>;
}