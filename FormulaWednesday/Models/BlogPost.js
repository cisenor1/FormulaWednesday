var BlogPost = (function () {
    function BlogPost(message, username, date) {
        this.message = message;
        this.user = username;
        if (date) {
            this.timestamp = new Date(Date.parse(date));
        }
        else {
            this.timestamp = new Date();
        }
    }
    BlogPost.prototype.getUser = function () {
        return this.user;
    };
    BlogPost.prototype.getMessage = function () {
        return this.message;
    };
    BlogPost.prototype.getTimestamp = function () {
        return this.timestamp.toLocaleDateString();
    };
    return BlogPost;
}());
