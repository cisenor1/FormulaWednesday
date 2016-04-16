var FormulaWednesdaysUtilities = (function () {
    function FormulaWednesdaysUtilities() {
    }
    FormulaWednesdaysUtilities.hashPassword = function (pass) {
        return md5(pass);
    };
    FormulaWednesdaysUtilities.validateUsername = function (name) {
        if (!name.match(/^[a-z0-9_-]{3,16}$/)) {
            return false;
        }
        return true;
    };
    FormulaWednesdaysUtilities.getKeyFromEmail = function (email) {
        var split = email.split("@")[0];
        var cleaned = split.split(".").join("");
        return cleaned;
    };
    return FormulaWednesdaysUtilities;
})();
//# sourceMappingURL=FormulaWednesdaysUtilities.js.map