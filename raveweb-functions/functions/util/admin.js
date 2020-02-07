const admin = require('firebase-admin');

const serviceAcc = require('../secret.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAcc),
  databaseURL: 'https://raveweb-7ff67.firebaseio.com'
});

const db = admin.firestore();

module.exports = { admin, db };
