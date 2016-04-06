interface User {
    id: KnockoutObservable<string>;
    name: KnockoutObservable<string>;
    role: KnockoutObservable<string>;
    points: KnockoutObservable<number>;
    editing: KnockoutObservable<boolean>;
}