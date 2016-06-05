var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HomePage = (function (_super) {
    __extends(HomePage, _super);
    function HomePage(app) {
        _super.call(this, app);
        this.markupUri = "Pages/Homepage/Homepage.html";
        this.blogPosts = ko.observableArray([]);
        this.imageSource = ko.observable("");
        this.quote = ko.observable("");
        this.vmPromise = this.createVM();
    }
    HomePage.prototype.createVM = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getBlogPosts(5).then(function (bs) {
                _this.blogPosts(bs);
                var esc = FirebaseUtilities.escape("<u>Daniel Ricciardo (after finishing the race in 2nd)</u>: \"Just save it. Nothing you can say can make it any better.\"");
                _this.quote(FirebaseUtilities.unescape(esc));
                _this.imageSource("http://cdn.scahw.com.au/cdn-1d1b9f5cca9ef30/imagevaultfiles/id_405499/cf_7/ricciardo-monaco-628.jpg");
                resolve(_this);
            }).catch(function (e) {
                alert(e);
            });
        });
    };
    HomePage.prototype.getMarkup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.markupUri).then(function (value) {
                value.text().then(function (output) {
                    resolve(output);
                });
            });
        });
    };
    HomePage.prototype.getViewModel = function () {
        return this.vmPromise;
    };
    HomePage.prototype.getBlogPosts = function (count) {
        return FirebaseUtilities.getBlogPosts(count);
    };
    return HomePage;
})(PageBase);
