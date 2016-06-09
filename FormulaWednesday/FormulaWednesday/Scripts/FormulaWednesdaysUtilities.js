class FormulaWednesdaysUtilities {
    static hashPassword(pass) {
        return md5(pass);
    }
    static validatedisplayName(name) {
        if (!name.match(/^[a-z0-9_-]{3,16}$/)) {
            return false;
        }
        return true;
    }
    static getKeyFromEmail(email) {
        var split = email.split("@")[0];
        var cleaned = split.split(".").join("");
        return cleaned;
    }
    static positionToPoints(pos) {
        return this.posToPts[pos];
    }
    static getDriverStandings(season) {
        if (!season) {
            season = "current";
        }
        var url = this.ergastUrl + season + "/driverstandings.json";
        return new Promise((resolve, reject) => {
            fetch(url).then((res) => {
                res.text().then((x) => {
                    var standings = JSON.parse(x);
                    var out = [];
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
            }).catch((err) => { reject(err); });
        });
    }
}
FormulaWednesdaysUtilities.ergastUrl = "http://ergast.com/api/f1/";
FormulaWednesdaysUtilities.posToPts = [0, 25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
