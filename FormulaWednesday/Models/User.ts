interface User {
    username: KnockoutObservable<string>;
    fullname: KnockoutObservable<string>;
    role: KnockoutObservable<string>;
    points: KnockoutObservable<number>;
    editing: KnockoutObservable<boolean>;
    results?: any;
    email: KnockoutObservable<string>;
    key: KnockoutObservable<string>;
}