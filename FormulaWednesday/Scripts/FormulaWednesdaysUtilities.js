var FormulaWednesdaysUtilities = (function () {
    function FormulaWednesdaysUtilities() {
    }
    FormulaWednesdaysUtilities.hashPassword = function (pass) {
        return md5(pass);
    };
    FormulaWednesdaysUtilities.validateUsername = function (name) {
        if (!name.match(/^[a-z0-9_-]{3,16}$/)) {
            return false;
        }
        return true;
    };
    FormulaWednesdaysUtilities.getKeyFromEmail = function (email) {
        var split = email.split("@")[0];
        var cleaned = split.split(".").join("");
        return cleaned;
    };
    FormulaWednesdaysUtilities.positionToPoints = function (pos) {
        return this.posToPts[pos];
    };
    FormulaWednesdaysUtilities.getLapTimes = function (round, season) {
        if (!season) {
            season = "current";
        }
        var url = this.ergastUrl + season + "/" + round + "/laps.json";
        return new Promise(function (resolve, reject) {
            fetch(url).then(function (res) {
                res.text().then(function (x) {
                    var standings = JSON.parse(x);
                    var out = [];
                    debugger;
                    var driverStandings = standings.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                    driverStandings.forEach(function (d) {
                        out.push({
                            key: d.Driver.code,
                            laps: d.wins
                        });
                    });
                    resolve(out);
                });
            }).catch(function (err) { reject(err); });
        });
    };
    FormulaWednesdaysUtilities.getDriverStandings = function (season) {
        if (!season) {
            season = "current";
        }
        var url = this.ergastUrl + season + "/driverstandings.json";
        return new Promise(function (resolve, reject) {
            fetch(url).then(function (res) {
                res.text().then(function (x) {
                    var standings = JSON.parse(x);
                    var out = [];
                    var driverStandings = standings.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                    driverStandings.forEach(function (d) {
                        out.push({
                            key: d.Driver.code,
                            points: d.points,
                            wins: d.wins
                        });
                    });
                    resolve(out);
                });
            }).catch(function (err) { reject(err); });
        });
    };
    FormulaWednesdaysUtilities.ergastUrl = "http://ergast.com/api/f1/";
    FormulaWednesdaysUtilities.posToPts = [0, 25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return FormulaWednesdaysUtilities;
}());
