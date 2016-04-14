interface Challenge {
    key: string;
    message: string;
    value: number;
    description: string;
    type: string;
    choice?: KnockoutObservable<any>;
    allSeason?: boolean;
}