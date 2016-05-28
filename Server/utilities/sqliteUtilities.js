'use strict';

var Promise = require('bluebird');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../Data/formulawednesday.sqlite');

const driverSelect = "SELECT drivers.key, drivers.active, drivers.name, drivers.points, drivers.teamkey as teamKey, teams.name as teamName FROM drivers inner join teams on drivers.teamKey == teams.key";
const raceSelect = "select r.*, s.cutoff, s.racedate as raceDate from races as r inner join seasons as s on r.key == s.racekey";
const challengeSelect = "select c.* from challenges as c inner join activechallenges as ac on c.key == ac.challengekey";

function getDrivers(key) {
    return new Promise(function (resolve, reject) {
        var whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(driverSelect + " " + whereStatement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

function getRaces(season, key) {
    return new Promise(function (resolve, reject) {
        var whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(raceSelect + " " + whereStatement, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};



function getChallenges(season, raceKey, challengeKey) {
    return new Promise(function (resolve, reject) {
        if (!season || !raceKey) {
            reject(new Error("Need a season and a race key"));
            return;
        }
        var driverPromise = getDrivers();
        var challengePromise = _getChallengesInternal(season, raceKey);
        var challengeChoiceMapsPromise = _getChallengeChoicesInternal(season, raceKey);
        Promise.all([driverPromise, challengePromise, challengeChoiceMapsPromise]).then((results) => {
            var challenges = results[1];
            var drivers = results[0];
            var challengeChoiceMaps = results[2];
            challenges.forEach(challenge => {
                var challengeChoiceMap = challengeChoiceMaps.filter(map => { return map.challengeKey === challenge.key; })[0];
                if (!challengeChoiceMap) {
                    challenge.driverChoices = drivers.slice(0);
                }
                else {
                    challenge.driverChoices = drivers.filter(driver => {
                        return challengeChoiceMap.drivers.some(dk => { dk === driver.key; })
                    });
                }
            });
            if (!challenges) {
                reject(new Error("internal error while retrieving challenges"));
            }
            resolve(challenges);
        });
    });
};

function _getChallengesInternal(season, raceKey) {
    return new Promise(function (resolve, reject) {
        var where = "where ac.season = " + season + " and ac.racekey = '" + raceKey + "'";
        db.all(challengeSelect + " " + where, function (err, rows) {
            resolve(rows);
        });
    });
};

function _getChallengeChoicesInternal(season, raceKey) {
    return new Promise(function (resolve, reject) {
        var statement = "select challengekey as challengeKey, season, racekey as raceKey, driverkey as driverKey from challengechoices where challengechoices.challengeKey in " +
            "(select c.key from challenges as c inner join activechallenges as ac on c.key == ac.challengekey where ac.season = " +
            season + " and ac.racekey = '" + raceKey + "')";
        var challengeChoiceMaps = [];
        db.all(statement, function (err, rows) {
            rows.forEach(row => {
                var challengeChoiceMap = challengeChoiceMaps.filter(function (value) { return value.challengeKey === row.challengeKey; })[0];
                if (challengeChoiceMap) {
                    challengeChoiceMap.drivers.push(row.driverKey);
                }
                else {
                    var challengeChoiceMap = {
                        challengeKey: row.challengeKey,
                        drivers: []
                    };
                    challengeChoiceMap.drivers.push(row.driverKey);
                    challengeChoiceMaps.push(challengeChoiceMap);
                }
            });
            resolve(challengeChoiceMaps);
        });
    });
}

module.exports = {
    getDrivers: getDrivers,
    getRaces: getRaces,
    getChallenges: getChallenges
}