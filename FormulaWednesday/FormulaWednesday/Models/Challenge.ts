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

interface RestChallenge {
    key: string;
    description: string;
    message: string;
    type: string;
    value: number;
    raceKey: string;
    driverChoices: RestDriverChoice[];
}

interface RestDriverChoice {
    key: string;
    active: boolean;
    name: string;
    points: number;
    teamKey: string;
    teamName: string;
}

interface RestUserPick {
    key: string;
    value: string;
}