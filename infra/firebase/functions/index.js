const admin = require("firebase-admin");
const functions = require("firebase-functions");

const serviceAccount = require("/root/.config/firebase/service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase Functions!");
});
