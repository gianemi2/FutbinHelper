const { query } = require('express');
const firebase = require('firebase')
require('dotenv').config()

const { API_KEY, MESSAGING_SENDER_ID, APP_ID } = process.env;

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: "futbinapi.firebaseapp.com",
    databaseURL: "https://futbinapi.firebaseio.com",
    projectId: "futbinapi",
    storageBucket: "futbinapi.appspot.com",
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.enablePersistence()
    .catch(function (err) {
        console.log(err.code);
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });

/**
 * 
 * @param {number} page 
 * @param {number} resultPerPage 
 * @returns {Promise}
 */
const getAllSbcs = async (page = false, resultPerPage = 50, dateFilter = {}) => {
    let sbcs = [];
    await db.collection('sbc').get()
        .then(querySnapshot => {
            if (dateFilter.start) {
                querySnapshot.docs.forEach(doc => {
                    const sbc = doc.data()
                    const sbcDates = {
                        start: new Date(sbc.dates.startsOn).getTime(),
                        end: new Date(sbc.dates.endsOn).getTime()
                    }
                    const requiredDates = {
                        start: new Date(dateFilter.start).getTime(),
                        end: new Date(dateFilter.end).getTime()
                    }

                    if (sbcDates.start > requiredDates.start && sbcDates.start < requiredDates.end) {
                        sbcs.push(sbc)
                    }
                })
            } else {
                let results = page ? querySnapshot.docs.splice(page * resultPerPage, resultPerPage) : querySnapshot.docs

                results.forEach(doc => {
                    sbcs.push(doc.data());
                });
            }
        });
    return sbcs;
}

const getLastYearTodaySbcs = async () => {

    const sbcs = await db.collection('sbc').get()
        .then(querySnapshot => {
            const sbcs = {
                past: [],
                today: [],
                future: []
            }

            querySnapshot.docs.forEach(doc => {
                const sbc = doc.data();

                const sbcDate = new Date(sbc.dates.startsOn);
                const today = new Date();

                const diff = daysBetween(today, sbcDate);

                if (diff < 8 && diff > 0) {
                    sbcs.future.push(sbc);
                } else if (diff == 0) {
                    sbcs.today.push(sbc);
                } else if (diff > -8 && diff < 0) {
                    sbcs.past.push(sbc);
                }
            })
            return sbcs;
        })
    return sbcs;
}

const daysBetween = (first, second) => {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(new Date().getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(new Date().getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
}

module.exports = { getAllSbcs, db, getLastYearTodaySbcs }