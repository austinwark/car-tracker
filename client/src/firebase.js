// import firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/database';
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var config = {
  apiKey: "AIzaSyCGYq2ZkkoxviFarec_meoPX0D-ymWZ89k",
  authDomain: "car-tracker-52923.firebaseapp.com",
  databaseURL: "https://car-tracker-52923.firebaseio.com",
  projectId: "car-tracker-52923",
  storageBucket: "car-tracker-52923.appspot.com",
  messagingSenderId: "262471237044",
  appId: "1:262471237044:web:d8230015c3c4cb16b546e1"
};
console.log("WINDOW", window)
// Initialize Firebase
firebase.initializeApp(config);

module.exports = firebase;
