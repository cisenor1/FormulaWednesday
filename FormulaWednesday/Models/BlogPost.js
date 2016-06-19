class BlogPost {
    constructor(message, username, date) {
        this.message = message;
        this.user = username;
        if (date) {
            this.timestamp = new Date(Date.parse(date));
        }
        else {
            this.timestamp = new Date();
        }
    }
    getUser() {
        return this.user;
    }
    getMessage() {
        return this.message;
    }
    getTimestamp() {
        return this.timestamp.toLocaleDateString();
    }
}
