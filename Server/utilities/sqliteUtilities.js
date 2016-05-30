'use strict';

const Promise = require('bluebird');
const sqlite3 = require('sqlite3').verbose();
const formatString = require('format-string');
const db = new sqlite3.Database('../Data/formulawednesday.sqlite');

const driverSelect = "SELECT drivers.key, drivers.active, drivers.name, drivers.points, drivers.teamkey as teamKey, teams.name as teamName FROM drivers inner join teams on drivers.teamKey == teams.key";
const raceSelect = "select r.*, s.cutoff, s.racedate as raceDate from races as r inner join seasons as s on r.key == s.racekey";
const challengeSelect = "select c.*, ac.racekey as raceKey from challenges as c inner join activechallenges as ac on c.key == ac.challengekey";
const userSelect = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.pass, users.points from users";
const basicUserSelect = "select users.displayname as displayName, users.firstname as firstName, users.key, users.points from users";
const userSelectNoPass = "select users.displayname as displayName, users.email, users.firstname as firstName, users.key, users.lastname as lastName, users.role, users.points from users";
const userChoiceSelect = "select userchoices.challengeKey as key, userchoices.choice as value from userchoices";
const userInsert = "INSERT INTO users (key, email, pass, displayname, firstname, lastname, role)";

function getDrivers(key) {
    return new Promise((resolve, reject) => {
        let whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(driverSelect + " " + whereStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

function getRaces(season, key) {
    return new Promise((resolve, reject) => {
        let whereStatement = "";
        if (key) {
            whereStatement = "where key = '" + key + "'";
        }
        db.all(raceSelect + " " + whereStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

function getUsers(email, withPassword) {
    return new Promise((resolve, reject) => {
        let selectStatement;
        if (withPassword) {
            selectStatement = userSelect;
        }
        else {
            selectStatement = userSelectNoPass;
        }
        if (email) {
            selectStatement = selectStatement + " where users.email = '" + email + "'";
        }
        db.all(selectStatement, (err, rows) => {
            if (err) {
                console.log("rejecting");
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function getBasicUsers() {
    return new Promise((resolve, reject) => {
        let selectStatement = basicUserSelect;
        db.all(selectStatement, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function saveUser(user) {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(new Error("must have a user to save"));
            return;
        }
        
        let valuesStatement = "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7);";
        let valuesObject = {
            1: user.key,
            2: user.email,
            3: user.password,
            4: user.displayName ? user.displayName : "",
            5: user.firstName ? user.firstName : "",
            6: user.lastName ? user.lastName : "",
            7: user.role
        };
        var insertStatement = userInsert + " " + valuesStatement;
        db.run(insertStatement, valuesObject, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

function getChallenges(season, raceKey, challengeKey) {
    return new Promise((resolve, reject) => {
        if (!season) {
            reject(new Error("Need a season and a race key"));
            return;
        }
        let driverPromise = getDrivers();
        let challengePromise = _getChallengesInternal(season, raceKey);
        let challengeChoiceMapsPromise = _getChallengeChoicesInternal(season, raceKey);
        Promise.all([driverPromise, challengePromise, challengeChoiceMapsPromise]).then((results) => {
            let challenges = results[1];
            let drivers = results[0];
            let challengeChoiceMaps = results[2];
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

function getUserPicks(userKey, season, raceKey, challengeKey) {
    return new Promise((resolve, reject) => {
        let statement = userChoiceSelect + " where userkey = ?1 and season = ?2 and racekey = ?3";
        let valuesObject = {
            1: userKey,
            2: season,
            3: raceKey
        };
        if (challengeKey) {
            statement = statement + " and challengekey = ?4";
            valuesObject[4] = challengeKey;
        }
        db.all(statement, valuesObject, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function _getChallengesInternal(season, raceKey) {
    return new Promise((resolve, reject) => {
        let where = "where ac.season = " + season;
        if (raceKey) {
            where = where + " and ac.racekey = '" + raceKey + "'";
        }
        db.all(challengeSelect + " " + where, function (err, rows) {
            resolve(rows);
        });
    });
};

function _getChallengeChoicesInternal(season, raceKey) {
    return new Promise((resolve, reject) => {
        let statement = "select challengekey as challengeKey, season, racekey as raceKey, driverkey as driverKey from challengechoices where challengechoices.challengeKey in " +
            "(select c.key from challenges as c inner join activechallenges as ac on c.key == ac.challengekey where ac.season = " +
            season + " and ac.racekey = '" + raceKey + "')";
        let challengeChoiceMaps = [];
        db.all(statement, (err, rows) => {
            rows.forEach(row => {
                let challengeChoiceMap = challengeChoiceMaps.filter(value => { return value.challengeKey === row.challengeKey; })[0];
                if (challengeChoiceMap) {
                    challengeChoiceMap.drivers.push(row.driverKey);
                }
                else {
                    let challengeChoiceMap = {
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
    getChallenges: getChallenges,
    getUsers: getUsers,
    getBasicUsers: getBasicUsers,
    saveUser: saveUser,
    getUserPicks: getUserPicks
}