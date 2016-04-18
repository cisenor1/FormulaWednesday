interface Race {
    name: string,
    title: string,
    date: Date,
    cutoff: Date,
    country: string,
    city: string,
    winner?: KnockoutObservable<Driver>,
    results?: any; 
    validating?: KnockoutObservable<boolean>
    done: KnockoutObservable<boolean>;

}