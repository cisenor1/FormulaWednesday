class FormulaWednesdaysUtilities {
    static hashPassword(pass: string): string {
        return md5(pass);
    }

    static validateUsername(name: string): boolean {
        if (!name.match(/^[a-z0-9_-]{3,16}$/)){
            return false;
        }

        return true;
    }

    static getKeyFromEmail(email: string): string {
        var split = email.split("@")[0];
        var cleaned = split.split(".").join("");
        return cleaned;

    }
    
}