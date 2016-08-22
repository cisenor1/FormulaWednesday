class FormulaWednesdaysUtilities {
    static ergastUrl = "http://ergast.com/api/f1/";
    static posToPts = [0, 25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    static hashPassword(pass: string): string {
        return md5(pass);
    }

    static validateUsername(name: string): boolean {
        if (!name.match(/^[a-z0-9_-]{3,16}$/)) {
            return false;
        }

        return true;
    }

    static getKeyFromEmail(email: string): string {
        var split = email.split("@")[0];
        var cleaned = split.split(".").join("");
        return cleaned;

    }

    static positionToPoints(pos: number): number {
        return this.posToPts[pos];
    }

    static getLapTimes(round?: number, season?): Promise<LapTimes[]> {
        if (!season) {
            season = "current";
        }
        var url = this.ergastUrl + season + "/" + round + "/laps.json";
        return new Promise<LapTimes[]>((resolve, reject) => {
            fetch(url).then((res) => {
                res.text().then((x) => {
                    var standings = JSON.parse(x);
                    var out: LapTimes[] = [];
                    debugger;
                    var driverStandings = standings.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                    driverStandings.forEach((d) => {
                        out.push({
                            key: d.Driver.code,
                            laps: d.wins
                        });
                    });
                    resolve(out);
                });
            }).catch((err) => { reject(err) });
        });
    }

    static getDriverStandings(season?: string): Promise<StandingsObject[]> {
        if (!season) {
            season = "current";
        }
        var url = this.ergastUrl + season + "/driverstandings.json"
        return new Promise<StandingsObject[]>((resolve, reject) => {
            fetch(url).then((res) => {
                res.text().then((x) => {
                    var standings = JSON.parse(x);
                    var out: StandingsObject[] = [];
                    var driverStandings = standings.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                    driverStandings.forEach((d) => {
                        out.push({
                            key: d.Driver.code,
                            points: d.points,
                            wins: d.wins
                        });
                    });
                    resolve(out);
                });
            }).catch((err) => { reject(err) });
        });
    }
}