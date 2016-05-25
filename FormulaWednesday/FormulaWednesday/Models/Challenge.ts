interface Challenge {
    key: KnockoutObservable<string>;
    message: KnockoutObservable<string>;
    value: KnockoutObservable<number>;
    description: KnockoutObservable<string>;
    type: KnockoutObservable<string>;
    choice?: KnockoutObservable<any>;
    allSeason?: KnockoutObservable<boolean>;
    editing?: KnockoutObservable<boolean>;
    drivers?: KnockoutObservableArray<Driver>;
}