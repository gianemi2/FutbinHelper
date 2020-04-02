//@ts-check
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
const getAllSbcs = async (page, resultPerPage = 50) => {
    const sbcs = [];
    await db.collection('sbc').get()
        .then(querySnapshot => {
            console.log(querySnapshot.metadata.fromCache);
            querySnapshot.docs.splice(page * resultPerPage, resultPerPage).forEach(doc => {
                sbcs.push(doc.data());
            });
        });
    return sbcs;
}

export { getAllSbcs, db }
