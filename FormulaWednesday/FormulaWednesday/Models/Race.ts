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

}

interface Result {
    challenge: string;
    winner: string;
}