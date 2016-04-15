interface User {
    username: KnockoutObservable<string>;
    fullname: KnockoutObservable<string>;
    role: KnockoutObservable<string>;
    points: KnockoutObservable<number>;
    editing: KnockoutObservable<boolean>;
    email: KnockoutObservable<string>;
    key: KnockoutObservable<string>;
}