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
                var esc = FirebaseUtilities.escape("<u>Nico Rosberg:</u> \"Gearbox problem!\"<br/><u>Pit Wall:</u>\"Driver default 101, chassis default 01.Chassis default 01. Avoid seventh gear, Nico.\"<br/><u>Nico Rosberg:</u>\"What‘s that mean? I have to shift through it.\"<br/><u>Pit Wall:</u>\"Affirm Nico you need to shift through it, affirm.\"");
                _this.quote(FirebaseUtilities.unescape(esc));
                _this.imageSource("http://cf.c.ooyala.com/BrdjQ3dDpXVPeQdXcDaZESodQtIjCV54/3Gduepif0T1UGY8H4xMDoxOjBzMTt2bJ");
                resolve(_this);
            }).catch(function (e) {
                _this.app.alert(e);
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
}(PageBase));
