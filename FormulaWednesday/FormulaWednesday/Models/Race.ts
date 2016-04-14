interface Race {
    name: string,
    title: string,
    date: Date,
    cutoff: Date,
    country: string,
    city: string,
    winner?: Driver,
    results?: any; 
    done: KnockoutObservable<boolean>;
}