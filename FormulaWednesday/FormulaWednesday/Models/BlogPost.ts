class BlogPost {
    private message: string;
    private timestamp: Date;
    private user: string;
    constructor(message: string, displayName: string, date?:string) {
        this.message = message;
        this.user = displayName;
        if (date) {
            this.timestamp = new Date(Date.parse(date));
        } else {
            this.timestamp = new Date();
        }
    }
    getUser(): string {
        return this.user;
    }
    getMessage(): string {
        return this.message;
    }
    getTimestamp(): string {
        return this.timestamp.toLocaleDateString();
    }
}

interface BlogObject {
    title: string;
    message: string;
    timestamp: string;
    user: User;
}