interface Race {
    name: string,
    title: string,
    date: Date,
    cutoff: Date,
    country: string,
    city: string,
    winner?: KnockoutObservable<Driver>,
    results?: any;
    season: number;
    validating?: KnockoutObservable<boolean>
    done: KnockoutObservable<boolean>;
    challenges?: KnockoutObservableArray<Challenge>;
    scored?: KnockoutObservable<boolean>;
}

interface RestRace {
    key: string,
    city: string,
    country: string,
    title: string,
    latitude: number,
    longitude: number,
    cutoff: string,
    raceDate: string
}

interface Result {
    challenge: string;
    winner: string;
}