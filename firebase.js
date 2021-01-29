const admin = require("firebase-admin");

const serviceAccount = require("./key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://demoapp-0904-989e7.firebaseio.com"
});

module.exports = admin;